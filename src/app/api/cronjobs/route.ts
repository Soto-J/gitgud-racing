import type { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { eq, gt, and } from "drizzle-orm";

import { seriesWeeklyStatsTable } from "@/db/schemas";
import { db } from "@/db";

import env from "@/env";

import * as utilities from "@/app/api/cronjobs/utilities";

import { getOrRefreshAuthCode } from "@/modules/iracing/server/authentication";

import { fetchData } from "@/modules/iracing/server/api";

import {
  SeriesResults,
  SeriesResultsResponseSchema,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  console.log(
    "Cron job started at:",
    DateTime.now().toLocaleString(DateTime.DATETIME_MED),
  );

  const cachedWeeklyResults = await cacheCurrentWeekResults();

  if (cachedWeeklyResults?.error) {
    console.error("Cron job error: Failed to cache weekly results.");
    return Response.json({ success: false }, { status: 500 });
  }

  console.log("Cron job completed successfully");
  return Response.json({ success: true });
}

const cacheCurrentWeekResults = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  const seasonInfo = utilities.getCurrentSeasonInfo();

  const weeklyResults = await db
    .select()
    .from(seriesWeeklyStatsTable)
    .where(
      and(
        eq(seriesWeeklyStatsTable.seasonYear, +seasonInfo.currentYear),
        eq(seriesWeeklyStatsTable.seasonQuarter, +seasonInfo.currentQuarter),
        gt(
          seriesWeeklyStatsTable.updatedAt,
          DateTime.now().minus({ weeks: 1 }).toJSDate(),
        ),
      ),
    );

  if (weeklyResults.length > 0) {
    console.log(
      `Using cached weekly results..\nYear ~ ${weeklyResults[0].seasonYear}, Quarter ~ ${weeklyResults[0].seasonQuarter}, Race Week ~ ${weeklyResults[0].raceWeek}`,
    );

    return { success: true };
  }
  console.log("Refreshing weekly results.");

  const searchParams = utilities.createSearchParams({
    season_year: seasonInfo.currentYear,
    season_quarter: seasonInfo.currentQuarter,
    event_types: "5",
    official_only: "true",
    race_week_num: seasonInfo.currentRaceWeek,

    start_range_begin: "",
    start_range_end: "",
    cust_id: "",
    team_id: "",
    category_id: "",
  });

  const authCode = await getOrRefreshAuthCode();

  const response = await fetchData({
    query: `/data/results/search_series${searchParams}`,
    authCode,
  });

  const seriesResults = SeriesResultsResponseSchema.parse(response);

  if (seriesResults.length === 0) {
    console.log("No race data available for current week");
    return { success: true };
  }

  const seriesByGroup = seriesResults.reduce(
    (acc, session) => {
      if (!acc[session.series_id]) {
        acc[session.series_id] = [];
      }
      acc[session.series_id].push(session);
      return acc;
    },
    {} as Record<number, SeriesResults[]>,
  );

  const statsRecords = Object.values(seriesByGroup).map((seriesSessions) => {
    const uniqueRaces = seriesSessions.reduce(
      (obj, session) => {
        if (!obj[session.start_time]) {
          obj[session.start_time] = [];
        }
        obj[session.start_time].push(session);
        return obj;
      },
      {} as Record<string, SeriesResults[]>,
    );

    const totalSplits = seriesSessions.length;
    const totalRaces = Object.values(uniqueRaces).length;
    const totalDrivers = seriesSessions.reduce(
      (total, session) => total + session.num_drivers,
      0,
    );

    const avgSplitPerRace =
      totalRaces > 0 ? (totalSplits / totalRaces).toFixed(2) : "0";
    const avgEntrantPerSeries =
      totalSplits > 0 ? (totalDrivers / totalSplits).toFixed(2) : "0";

    return {
      seriesId: seriesSessions[0].series_id,
      seasonId: seriesSessions[0].season_id,
      sessionId: seriesSessions[0].session_id,
      name: seriesSessions[0].series_name.trim(),
      seasonYear: seriesSessions[0].season_year,
      seasonQuarter: seriesSessions[0].season_quarter,
      raceWeek: seriesSessions[0].race_week_num,
      trackName: seriesSessions[0].track.track_name.trim(),
      startTime: seriesSessions[0].start_time.trim(),
      totalSplits,
      totalDrivers,
      strengthOfField: seriesSessions[0].event_strength_of_field,
      averageEntrants: avgEntrantPerSeries,
      averageSplits: avgSplitPerRace,
    };
  });

  try {
    await db.insert(seriesWeeklyStatsTable).values(statsRecords);
    return { success: true };
  } catch (error) {
    console.error("Error in cacheCurrentWeekResults:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
};

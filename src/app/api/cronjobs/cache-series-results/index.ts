import type { NextRequest } from "next/server";
import { db } from "@/db";
import { getAccessToken } from "./helpers/auth";
import { getSeasonDates } from "./helpers/season";

import { sql, eq, gt, and } from "drizzle-orm";
import { seriesWeeklyStatsTable } from "@/db/schemas";
import { ResultsSeriesParams } from "@/modules/series-stats/server/procedures/results-series/types";
import {
  SeriesResults,
  SeriesResultsResponse,
  SeriesResultsResponseSchema,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";
import { fetchIracingData } from "@/modules/iracing/server/api";
import { z } from "zod";

export { getAccessToken, getSeasonDates };

const MS_WITHIN_7_DAYS = 7 * 24 * 60 * 60 * 1_000;

export async function cacheCurrentWeekResults(): Promise<{
  success: boolean;
  error?: string;
}> {
  const currentSeason = getSeasonDates();

  const weeklyResults = await db
    .select()
    .from(seriesWeeklyStatsTable)
    .where(
      and(
        eq(seriesWeeklyStatsTable.seasonYear, currentSeason.year),
        eq(seriesWeeklyStatsTable.seasonQuarter, currentSeason.quarter),
        eq(seriesWeeklyStatsTable.raceWeek, currentSeason.raceWeek),
        gt(
          seriesWeeklyStatsTable.updatedAt,
          new Date(Date.now() - MS_WITHIN_7_DAYS),
        ),
      ),
    );

  if (weeklyResults.length > 0) {
    console.log("[Cronjob] Using cached weekly results.");
    console.log(
      `Year ~ ${weeklyResults[0].seasonYear}, Quarter ~ ${weeklyResults[0].seasonQuarter}, Race Week ~ ${weeklyResults[0].raceWeek}`,
    );
    return { success: true };
  }

  console.log("Refreshing weekly results.");
  const searchParams = createSearchParams({
    season_year: currentSeason.year,
    season_quarter: currentSeason.quarter,
    race_week_num: currentSeason.raceWeek,
    event_types: 5,
    official_only: true,
  });

  let accessToken: string;

  try {
    accessToken = await getAccessToken();
  } catch (error) {
    console.error("Failed to acquire access token:", error);
    return { success: false, error: "Token acquisition failed" };
  }

  let response;

  try {
    response = await fetchIracingData(
      `/data/results/search_series${searchParams}`,
      accessToken,
    );
  } catch (error) {
    console.error("Failed to fetch iRacing data:", error);
    return { success: false, error: "API request failed" };
  }

  const seriesResults = SeriesResultsResponseSchema.safeParse(response);

  if (!seriesResults.success) {
    console.warn(
      "Schema validation failed:",
      z.treeifyError(seriesResults.error),
    );
    console.warn("Raw response:", JSON.stringify(response, null, 2));

    return { success: false };
  }

  const sessionsBySeries = groupSessionsBySeries(seriesResults.data);

  const statsRecords = Object.values(sessionsBySeries).map((seriesSessions) => {
    const firstSession = seriesSessions[0];
    const totalSplits = seriesSessions.length;
    const totalDrivers = seriesSessions.reduce(
      (total, session) => total + session.num_drivers,
      0,
    );

    return {
      seriesId: firstSession.series_id,
      seasonId: firstSession.season_id,
      sessionId: firstSession.session_id,

      name: firstSession.series_name.trim(),
      trackName: firstSession.track.track_name.trim(),

      seasonYear: firstSession.season_year,
      seasonQuarter: firstSession.season_quarter,
      raceWeek: firstSession.race_week_num,

      startTime: firstSession.start_time.trim(),
      totalSplits,
      totalDrivers,
      strengthOfField: firstSession.event_strength_of_field,
    };
  });

  try {
    await db
      .insert(seriesWeeklyStatsTable)
      .values(statsRecords)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
    return { success: true };
  } catch (error) {
    console.error("Error in cacheCurrentWeekResults:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export function createSearchParams(params: ResultsSeriesParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

function groupSessionsBySeries(sessions: SeriesResultsResponse) {
  return sessions.reduce(
    (acc, session) => {
      if (!acc[session.series_id]) {
        acc[session.series_id] = [];
      }
      acc[session.series_id].push(session);
      return acc;
    },
    {} as Record<number, SeriesResults[]>,
  );
}

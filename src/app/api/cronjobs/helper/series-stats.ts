import { z } from "zod";

import { fetchIracingData } from "@/modules/iracing/server/api";

import { sql } from "drizzle-orm";

import { seriesWeeklyStatsTable } from "@/db/schemas";
import { db } from "@/db";
import type { ResultsSeriesParams } from "@/modules/series-stats/server/procedures/results-series/types";
import {
  type SeriesResults,
  type SeriesResultsResponse,
  SeriesResultsResponseSchema,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";

import { getAccessToken } from ".";

export async function cacheCurrentWeekResults(currentSeason: {
  year: number;
  quarter: number;
  raceWeek: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
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

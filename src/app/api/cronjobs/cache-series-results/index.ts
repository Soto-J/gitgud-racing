import { z } from "zod";
import { sql, eq, gt, and, desc } from "drizzle-orm";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { getAccessToken } from "./helpers/auth";
import { getSeasonDates } from "./helpers/season";
import { fetchIracingData } from "@/modules/iracing/server/api";

import type { SeriesResultsParams } from "./types";
import {
  type SeriesResults,
  type SeriesResultsResponse,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";
import {
  ChunkResponseSchema,
  SeriesResultsResponseSchema,
} from "./types/schemas";

const MS_WITHIN_7_DAYS = 7 * 24 * 60 * 60 * 1_000;

export async function cacheCurrentWeekResults() {
  const currentSeason = getSeasonDates();

  const [weeklyResults] = await db
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
    )
    .orderBy(desc(seriesWeeklyStatsTable.updatedAt))
    .limit(1);

  if (weeklyResults) {
    console.log("[Cronjob] Using cached weekly results.");
    console.log(
      `Year ~ ${weeklyResults.seasonYear}, Quarter ~ ${weeklyResults.seasonQuarter}, Race Week ~ ${weeklyResults.raceWeek}`,
    );
    return { success: true };
  }

  let accessToken: string;

  try {
    console.log("[Cronjob] Refreshing weekly results.");
    accessToken = await getAccessToken();
  } catch (error) {
    console.error("[Cronjob] Failed to acquire access token:", error);
    return { success: false, error: "Token acquisition failed" };
  }

  let response;

  try {
    const searchParams = buildSearchParams({
      season_year: currentSeason.year,
      season_quarter: currentSeason.quarter,
      race_week_num: currentSeason.raceWeek,
      event_types: 5,
      official_only: true,
    });

    response = await fetchIracingData(
      `/data/results/search_series${searchParams}`,
      accessToken,
    );

    if (!response.ok) {
      console.error("[Cronjob] iRacing API error:", response.error);
      return { success: false, error: `iRacing API error: ${response.error}` };
    }
  } catch (error) {
    console.error("[Cronjob] Failed to fetch iRacing data:", error);
    return { success: false, error: "API request failed" };
  }

  const chunkPayload = SeriesResultsResponseSchema.safeParse(response.data);

  if (!chunkPayload.success) {
    console.warn(
      "[Cronjob] Schema validation failed:",
      z.treeifyError(chunkPayload.error),
    );
    console.warn("Raw response:", JSON.stringify(response, null, 2));

    return { success: false };
  }

  const { base_download_url, chunk_file_names } =
    chunkPayload.data.data.chunk_info;

  if (chunk_file_names.length === 0) {
    return { success: false, error: "[Cronjob] Chunkfiles empty" };
  }

  const chunkPromises = chunk_file_names.map(async (fileName) => {
    const url = base_download_url + fileName;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch chunk ${fileName}: ${response.statusText}`,
      );
    }

    return response.json();
  });

  const chunkResults = await Promise.allSettled(chunkPromises);

  const failed = chunkResults.filter(
    (r) => r.status === "rejected",
  ) as PromiseRejectedResult[];

  if (failed.length > 0) {
    console.error(
      "[Cronjob] Failed chunks:",
      failed.map((f) => f.reason),
    );
    return { success: false, error: "Failed to fetch all chunk files" };
  }

  const data = chunkResults
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const payload = ChunkResponseSchema.safeParse(data);

  if (!payload.success) {
    return { success: false, error: `[Cronjob] ${payload.error.message}` };
  }

  const groupedSeries = groupSessionsBySeries(payload.data);

  const statsRecords = Object.values(groupedSeries).map((series) => {
    const firstSession = series[0];
    const totalSplits = series.length;
    const totalDrivers = series.reduce(
      (total, session) => total + session.num_drivers,
      0,
    );

    // Count unique race sessions (parent session_id, not subsession splits)
    const uniqueRaceSessions = new Set(series.map((s) => s.session_id));
    const totalRaceSessions = uniqueRaceSessions.size;

    return {
      seriesId: firstSession.series_id,
      seasonId: firstSession.season_id,
      sessionId: firstSession.session_id,

      name: firstSession.series_name.trim(),
      trackName: firstSession.track.track_name.trim(),

      seasonYear: firstSession.season_year,
      seasonQuarter: firstSession.season_quarter,
      raceWeek: firstSession.race_week_num,

      officialSession: firstSession.official_session,
      startTime: new Date(firstSession.start_time),
      totalRaceSessions,
      totalSplits,
      totalDrivers,
      strengthOfField: firstSession.event_strength_of_field,
    };
  });

  try {
    await db
      .insert(seriesWeeklyStatsTable)
      .values(statsRecords)
      .onDuplicateKeyUpdate({
        set: {
          totalRaceSessions: sql`VALUES(total_race_sessions)`,
          totalSplits: sql`VALUES(total_splits)`,
          totalDrivers: sql`VALUES(total_drivers)`,
          strengthOfField: sql`VALUES(strength_of_field)`,
          startTime: sql`VALUES(start_time)`,
          officialSession: sql`VALUES(official_session)`,
        },
      });
    return { success: true };
  } catch (error) {
    console.error("[Cronjob] Error in cacheCurrentWeekResults:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}

export function buildSearchParams(params: SeriesResultsParams) {
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

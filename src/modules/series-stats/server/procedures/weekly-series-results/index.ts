import { eq, and, sql } from "drizzle-orm";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { iracingProcedure } from "@/trpc/init/iracing-procedure";
import { getSeasonDates } from "@/app/api/cronjobs/cache-series-results/helpers/season";

export const weeklySeriesResultsProcedure = iracingProcedure.query(async () => {
  const currentSeason = getSeasonDates();

  const result = await db
    .select({
      seriesId: seriesWeeklyStatsTable.seriesId,
      seasonId: seriesWeeklyStatsTable.seasonId,
      sessionId: seriesWeeklyStatsTable.sessionId,

      name: seriesWeeklyStatsTable.name,
      trackName: seriesWeeklyStatsTable.trackName,

      seasonYear: seriesWeeklyStatsTable.seasonYear,
      seasonQuarter: seriesWeeklyStatsTable.seasonQuarter,
      raceWeek: seriesWeeklyStatsTable.raceWeek,
      officialSession: seriesWeeklyStatsTable.officialSession,
      startTime: seriesWeeklyStatsTable.startTime,

      totalRaceSessions: seriesWeeklyStatsTable.totalRaceSessions,
      totalSplits: seriesWeeklyStatsTable.totalSplits,
      totalDrivers: seriesWeeklyStatsTable.totalDrivers,
      sof: seriesWeeklyStatsTable.strengthOfField,

      avgSplitsPerRace:
        sql<number>`ROUND(${seriesWeeklyStatsTable.totalSplits} / NULLIF(${seriesWeeklyStatsTable.totalRaceSessions}, 0), 1)`.as(
          "avg_splits_per_race",
        ),
      avgEntrantsPerRace:
        sql<number>`ROUND(${seriesWeeklyStatsTable.totalDrivers} / NULLIF(${seriesWeeklyStatsTable.totalRaceSessions}, 0), 1)`.as(
          "avg_entrants_per_race",
        ),
    })
    .from(seriesWeeklyStatsTable)
    .where(
      and(
        eq(seriesWeeklyStatsTable.officialSession, true),
        eq(seriesWeeklyStatsTable.seasonYear, currentSeason.year),
        eq(seriesWeeklyStatsTable.seasonQuarter, currentSeason.quarter),
        eq(seriesWeeklyStatsTable.raceWeek, currentSeason.raceWeek),
      ),
    );

  return result;
});

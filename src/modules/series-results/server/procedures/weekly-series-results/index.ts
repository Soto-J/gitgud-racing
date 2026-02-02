import { eq, and, sql, like, count } from "drizzle-orm";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { iracingProcedure } from "@/trpc/init/iracing-procedure";
import { getSeasonDates } from "@/lib/iracing/helpers/season-date";
import { WeeklySeriesResultsInputSchema } from "./types/schemas";

export const weeklySeriesResultsProcedure = iracingProcedure
  .input(WeeklySeriesResultsInputSchema)
  .query(async ({ input }) => {
    const { page, pageSize, search } = input;
    const currentSeason = getSeasonDates();

    const whereClause = and(
      eq(seriesWeeklyStatsTable.officialSession, true),
      eq(seriesWeeklyStatsTable.seasonYear, currentSeason.year),
      eq(seriesWeeklyStatsTable.seasonQuarter, currentSeason.quarter),
      eq(seriesWeeklyStatsTable.raceWeek, currentSeason.raceWeek),
      search ? like(seriesWeeklyStatsTable.name, `%${search}%`) : undefined,
    );

    const result = await db
      .select({
        seriesId: seriesWeeklyStatsTable.seriesId,
        seasonId: seriesWeeklyStatsTable.seasonId,

        name: seriesWeeklyStatsTable.name,
        trackName: seriesWeeklyStatsTable.trackName,

        seasonYear: seriesWeeklyStatsTable.seasonYear,
        seasonQuarter: seriesWeeklyStatsTable.seasonQuarter,
        raceWeek: seriesWeeklyStatsTable.raceWeek,
        officialSession: seriesWeeklyStatsTable.officialSession,

        totalRaceSessions: seriesWeeklyStatsTable.totalRaceSessions,
        totalSplits: seriesWeeklyStatsTable.totalSplits,
        totalDrivers: seriesWeeklyStatsTable.totalDrivers,

        avgStrengthOfField: seriesWeeklyStatsTable.averageStrengthOfField,
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
      .where(whereClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [total] = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(whereClause);

    const totalPages = Math.ceil(total.count / pageSize);

    return {
      series: result,
      total: total.count,
      totalPages,
    };
  });

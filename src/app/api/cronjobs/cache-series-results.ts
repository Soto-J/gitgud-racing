import { sql, eq, gt, and, desc } from "drizzle-orm";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { fetchSeriesResults } from "@/lib/iracing/series-results";
import { groupSessionsBySeries } from "@/lib/iracing/helpers";
import { getSeasonDates } from "@/lib/iracing/helpers/season-date";

const MS_WITHIN_7_DAYS = 7 * 24 * 60 * 60 * 1_000;

export async function cacheCurrentWeekResults() {
  const currentSeason = getSeasonDates();

  const [weeklySeriesResults] = await db
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

  if (weeklySeriesResults) {
    console.log("[Cronjob] Using cached weekly results.");
    console.log(
      `Year ~ ${weeklySeriesResults.seasonYear}, Quarter ~ ${weeklySeriesResults.seasonQuarter}, Race Week ~ ${weeklySeriesResults.raceWeek}`,
    );
    return { success: true };
  }

  const response = await fetchSeriesResults({
    season_year: currentSeason.year,
    season_quarter: currentSeason.quarter,
    race_week_num: currentSeason.raceWeek,
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  const groupedSeries = groupSessionsBySeries(response.data);

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

    // Aggregate calculations
    const averageStrengthOfField = Math.round(
      series.reduce((sum, s) => sum + s.event_strength_of_field, 0) /
        series.length,
    );
    const allOfficial = series.every((s) => s.official_session);

    return {
      seriesId: firstSession.series_id,
      seasonId: firstSession.season_id,

      name: firstSession.series_name.trim(),
      trackName: firstSession.track.track_name.trim(),

      seasonYear: firstSession.season_year,
      seasonQuarter: firstSession.season_quarter,
      raceWeek: firstSession.race_week_num,

      officialSession: allOfficial,
      totalRaceSessions,
      totalSplits,
      totalDrivers,
      averageStrengthOfField,
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
          averageStrengthOfField: sql`VALUES(average_strength_of_field)`,
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

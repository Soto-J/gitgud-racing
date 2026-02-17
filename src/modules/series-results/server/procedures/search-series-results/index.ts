import { baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import {
  fetchSeriesResults,
  type ChunkResponse,
  type SeriesResult,
} from "@/lib/iracing";
import { SeriesResultsInputSchema } from "./types/schema";

import { getSeasonDates } from "@/lib/iracing/helpers/season-date";

export const searchSeriesResultsProcedure = baseProcedure
  .input(SeriesResultsInputSchema)
  .query(async ({ input }) => {
    const { page, pageSize, search, ...urlParams } = input;

    const seasonDate = getSeasonDates();

    const response = await fetchSeriesResults({
      ...urlParams,
      season_year: seasonDate.year,
      season_quarter: seasonDate.quarter,
      race_week_num: seasonDate.raceWeek,
      official_only: true,
      event_types: [5],
      category_ids: [1, 3, 4, 5],
    });

    if (!response.success) {
      throw new TRPCError({ code: "BAD_GATEWAY", message: response.error });
    }

    const groupedSeries = groupSessionsBySeries(response.data);

    const statsRecords = Object.values(groupedSeries)
      .map((series) => {
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

          avgEntrantsPerRace:
            Math.round((totalDrivers / totalRaceSessions) * 10) / 10,
          avgSplitsPerRace:
            Math.round((totalSplits / totalRaceSessions) * 10) / 10,
        };
      })
      .sort(
        (a, b) =>
          b.avgEntrantsPerRace +
          b.avgSplitsPerRace -
          (a.avgEntrantsPerRace + a.avgSplitsPerRace),
      );

    return { series: statsRecords };
  });

function groupSessionsBySeries(sessions: ChunkResponse) {
  return sessions.reduce(
    (acc, session) => {
      if (!acc[session.series_id]) {
        acc[session.series_id] = [];
      }
      acc[session.series_id].push(session);
      return acc;
    },
    {} as Record<number, SeriesResult[]>,
  );
}

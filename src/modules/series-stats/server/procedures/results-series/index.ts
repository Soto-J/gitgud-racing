import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { fetchIracingData } from "@/modules/iracing/server/api";
import { TRPCError } from "@trpc/server";

import type { ResultsSeriesParams } from "./types";
import {
  ChunkResponseSchema,
  ResultsSeriesParamsSchema,
  ResultsSeriesSearchResponseSchema,
} from "./types/schemas";

export const ResultsSearchSeriesProcedure = iracingProcedure
  .input(ResultsSeriesParamsSchema)
  .query(async ({ ctx, input }) => {
    const searchParams = createSearchParams({
      ...input,
      season_year: 2026,
      season_quarter: 1,
      race_week_num: 1,
      official_only: true,
    });
    // const result = await fetchIracingData(
    //    `/data/results/search_series${searchParams}`,
    //   ctx.iracingAccessToken,
    // );

    // if (!result.ok) {
    //   throw new TRPCError({
    //     code: "BAD_GATEWAY",
    //     message: result.message,
    //   });
    // }
    // console.log({ result: result.data.seasons[0] });

    return true;

    const chunkPayload = ResultsSeriesSearchResponseSchema.safeParse(
      result?.data,
    );

    if (!chunkPayload.success) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: chunkPayload.error.message,
      });
    }

    // console.log({ result: chunkPayload.data });

    const { base_download_url, chunk_file_names } =
      chunkPayload.data.data.chunk_info;

    if (chunk_file_names.length === 0) {
      return { payload: [], total: 0 };
    }

    const chunkPromises = chunk_file_names.map(async (fileName) => {
      const url = base_download_url + fileName;
      const response = await fetch(url);

      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: `Failed to fetch chunk: ${response.statusText}`,
        });
      }

      return response.json();
    });

    const chunkResults = await Promise.all(chunkPromises);

    console.log({ chunkResults: chunkResults[0] });
    return true;

    const payload = ChunkResponseSchema.safeParse(chunkResults.flat());

    if (!payload.success) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: payload.error.message,
      });
    }

    console.log(payload.data);
    // TODO transform data before return
    return {
      payload: payload.data,
      total: payload.data.length,
    };
  });

export function createSearchParams(params: ResultsSeriesParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}
// export function getCurrentSeasonInfo() {
//   const IRacingSeasonStarts = [
//     { season: 1, start: new Date("2025-03-18T20:00:00") },
//     { season: 2, start: new Date("2025-06-17T20:00:00") },
//     { season: 3, start: new Date("2025-09-09T20:00:00") },
//     { season: 4, start: new Date("2025-09-15T20:00:00") },
//   ];

//   const now = new Date();

//   // find which season we're in
//   let currentSeason = IRacingSeasonStarts[0];

//   // default to last season of previous year if before first season
//   if (now < currentSeason.start) {
//     currentSeason = IRacingSeasonStarts[IRacingSeasonStarts.length - 1];
//     currentSeason = {
//       season: currentSeason.season,
//       start: currentSeason.start.minus({ years: 1 }),
//     };
//   } else {
//     for (let i = IRacingSeasonStarts.length - 1; i >= 0; i--) {
//       if (now >= IRacingSeasonStarts[i].start) {
//         currentSeason = IRacingSeasonStarts[i];
//         break;
//       }
//     }
//   }

//   const daysSinceStart = now.diff(currentSeason.start, "days").days;
//   const weeksSinceStart = Math.floor(daysSinceStart / 7);

//   return {
//     currentRaceWeek: Math.max(0, Math.min(weeksSinceStart, 11)).toString(),
//     currentQuarter: currentSeason.season.toString(),
//     currentYear: (now < IRacingSeasonStarts[0].start
//       ? now.year - 1
//       : now.year
//     ).toString(),
//   };
// }

// Group sessions by series and calculate stats
// const seriesStats = new Map<number, { totalDrivers: number; sessionCount: number; splits: Set<number> }>();

// for (const session of chunkResults.flat()) {
//   const stats = seriesStats.get(session.series_id) ?? {
//     totalDrivers: 0,
//     sessionCount: 0,
//     splits: new Set()
//   };

//   stats.totalDrivers += session.num_drivers;
//   stats.sessionCount++;
//   stats.splits.add(session.session_id); // parent session

//   seriesStats.set(session.series_id, stats);
// }

// // Calculate averages
// const results = Array.from(seriesStats.entries()).map(([seriesId, stats]) => ({
//   seriesId,
//   avgEntrants: stats.totalDrivers / stats.sessionCount,
//   avgSplits: stats.sessionCount / stats.splits.size,
// }));

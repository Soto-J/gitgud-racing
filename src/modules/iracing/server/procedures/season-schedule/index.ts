import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init";

import { fetchData } from "@/modules/iracing/server/api";

import {
  SeasonScheduleInputSchema,
  SeasonScheduleResponse,
} from "@/modules/iracing/server/procedures/season-schedule/schema";

export const seasonScheduleProcedure = iracingProcedure
  .input(SeasonScheduleInputSchema)
  .query(async ({ ctx, input }) => {
    const response = await fetchData({
      query: `/data/series/season_list?include_series=${input.includeSeries}&season_year=${input.seasonYear}&season_quarter=${input.seasonQuarter}`,
      authCode: ctx.iracingAuthCode,
    });

    if (!response) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to fetch season schedule from iRacing API.",
      });
    }

    try {
      const parsed = SeasonScheduleResponse.parse(response);
      return {
        seasonSchedule: parsed.seasons,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid response format from iRacing API",
        cause: error,
      });
    }
  });

// export const cacheSeasonsProcedure = iracingProcedure
//   .input(GetSeasonsInput)
//   .query(async ({ ctx, input }) => {
//     const { includeSearies, seasonYear, seasonQuarter } = input;

//     const res = await fetchData({
//       query: `/series/seasons?include_series=${includeSearies}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
//       authCode: ctx.iracingAuthCode,
//     });

//     if (!res) {
//       return { success: false, message: "Failed to fetch season data..." };
//     }

//     const seasonsResponse = z.array(SeasonScheduleResponse).parse(res);

//     if (seasonsResponse.length === 0) {
//       return { success: false, message: "No seasons found in response." };
//     }

//     const schedules = seasonsResponse.flatMap((season) => season.schedules);

//     const schdulesData = buildScheduleData(schedules);
//     const seasonsData = buildSeasonsData(seasonsResponse);

//     if (!seasonsData || !schdulesData) {
//       return { success: false, message: "Failed to build data." };
//     }

//     try {
//       await db.transaction(async (tx) => {
//         await tx
//           .insert(seasonTable)
//           .values(seasonsData)
//           .onDuplicateKeyUpdate({
//             set: {
//               active: sql`VALUES(active)`,
//               complete: sql`VALUES(complete)`,
//               updatedAt: sql`NOW()`,
//             },
//           });

//         await tx
//           .insert(raceScheduleTable)
//           .values(schdulesData)
//           .onDuplicateKeyUpdate({
//             set: {
//               id: sql`id`,
//             },
//           });
//       });

//       return {
//         success: true,
//         message: `Successfully cached ${seasonsResponse.length} seasons with ${schdulesData.length} total race weeks`,
//         seasonsProcessed: seasonsResponse.length,
//         seasonIds: seasonsData.map((season) => season.id),
//         totalScheduleCount: schdulesData.length,
//       };
//     } catch (error) {
//       console.error("Error in cacheSeasonsProcedure:", error);
//       if (error instanceof Error) {
//         return { success: false, message: `Error: ${error.message}` };
//       }
//       return { success: false, message: "Unknown error occurred" };
//     }
//   });

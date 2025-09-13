import { z } from "zod";
import { desc, sql } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/db";
import { seasonTable, raceScheduleTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";


// export const cacheSeasonsSchedule = async ({
//   includeSeries = "true",
//   seasonYear,
//   seasonQuarter,
//   authCode,
// }: {
//   includeSeries?: string;
//   seasonYear: string;
//   seasonQuarter: string;
//   authCode: string;
// }) => {
//   console.log("Caching Season Schedule...");
//   const seasons = await db
//     .select()
//     .from(seasonTable)
//     .orderBy(desc(seasonTable.updatedAt));

//   const latestSeason = seasons[0];

//   const hasFreshData =
//     latestSeason &&
//     latestSeason.seasonYear === +seasonYear &&
//     latestSeason.seasonQuarter === +seasonQuarter;

//   if (hasFreshData) {
//     return { success: true, message: "Seasons schedules are still fresh." };
//   }

//   const response = await fetchData({
//     query: `/series/seasons?include_series=${includeSeries}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
//     authCode,
//   });

//   if (!response) {
//     console.warn("Failed to fetch season data...");
//     return { success: false, message: "Failed to fetch season data..." };
//   }

//   const seasonsResponse = z.array(GetSeasonsResponse).parse(response);

//   if (seasonsResponse.length === 0) {
//     console.warn("No seasons found in response..");
//     return { success: false, message: "No seasons found in response." };
//   }

//   const schedules = seasonsResponse.flatMap((season) => season.schedules);

//   const schedulesData = buildScheduleData(schedules);
//   const seasonsData = buildSeasonsData(seasonsResponse);

//   if (!seasonsData || !schedulesData) {
//     console.warn("Failed to build data...");
//     return {
//       success: false,
//       message: "Failed to fetch season data...",
//     };
//   }

//   try {
//     await db.transaction(async (tx) => {
//       await tx
//         .insert(seasonTable)
//         .values(seasonsData)
//         .onDuplicateKeyUpdate({
//           set: {
//             active: sql`VALUES(active)`,
//             complete: sql`VALUES(complete)`,
//             updatedAt: sql`NOW()`,
//           },
//         });

//       await tx
//         .insert(raceScheduleTable)
//         .values(schedulesData)
//         .onDuplicateKeyUpdate({
//           set: {
//             id: sql`id`,
//           },
//         });
//     });

//     return {
//       success: true,
//       message: `Successfully cached ${seasonsResponse.length} seasons with ${schedulesData.length} total race weeks`,
//       seasonsProcessed: seasonsResponse.length,
//       seasonIds: seasonsData.map((season) => season.id),
//       totalScheduleCount: schedulesData.length,
//     };
//   } catch (error) {
//     console.error("Error in cacheSeasonsSchedule", {
//       error,
//       seasonsData,
//       schedulesData,
//     });
//     if (error instanceof Error) {
//       return { success: false, message: `Error: ${error.message}` };
//     }
//     return { success: false, message: "Unknown error occurred" };
//   }
// };

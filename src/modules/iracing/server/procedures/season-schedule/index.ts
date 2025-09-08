import { z } from "zod";
import { sql } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seasonTable, raceScheduleTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";

import {
  buildScheduleData,
  buildSeasonsData,
} from "@/modules/iracing/server/procedures/season-schedule/helper";

import {
  GetSeasonScheduleInput,
  GetSeasonsInput,
  GetSeasonsResponse,
} from "@/modules/iracing/server/procedures/season-schedule/schema";

export const seasonScheduleProcedure = iracingProcedure
  .input(GetSeasonScheduleInput)
  .query(async ({ input }) => {});

export const cacheSeasonsProcedure = iracingProcedure
  .input(GetSeasonsInput)
  .query(async ({ ctx, input }) => {
    const { includeSearies, seasonYear, seasonQuarter } = input;

    const res = await fetchData({
      query: `/series/seasons?include_series=${includeSearies}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
      authCode: ctx.iracingAuthCode,
    });

    if (!res) {
      return { success: false, message: "Failed to fetch season data..." };
    }

    const seasonsResponse = z.array(GetSeasonsResponse).parse(res);

    if (seasonsResponse.length === 0) {
      return { success: false, message: "No seasons found in response." };
    }

    const schedules = seasonsResponse.flatMap((season) => season.schedules);

    const schdulesData = buildScheduleData(schedules);
    const seasonsData = buildSeasonsData(seasonsResponse);

    if (!seasonsData || !schdulesData) {
      return { success: false, message: "Failed to build data." };
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .insert(seasonTable)
          .values(seasonsData)
          .onDuplicateKeyUpdate({
            set: {
              active: sql`VALUES(active)`,
              complete: sql`VALUES(complete)`,
              updatedAt: sql`NOW()`,
            },
          });

        await tx
          .insert(raceScheduleTable)
          .values(schdulesData)
          .onDuplicateKeyUpdate({
            set: {
              id: sql`id`,
            },
          });
      });

      return {
        success: true,
        message: `Successfully cached ${seasonsResponse.length} seasons with ${schdulesData.length} total race weeks`,
        seasonsProcessed: seasonsResponse.length,
        seasonIds: seasonsData.map((season) => season.id),
        totalScheduleCount: schdulesData.length,
      };
    } catch (error) {
      console.error("Error in cacheSeasonsProcedure:", error);
      if (error instanceof Error) {
        return { success: false, message: `Error: ${error.message}` };
      }
      return { success: false, message: "Unknown error occurred" };
    }
  });

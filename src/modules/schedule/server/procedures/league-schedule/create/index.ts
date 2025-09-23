
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

import { CreateLeagueScheduleInputSchema } from "./schema";

export const createLeagueScheduleProcedure = protectedProcedure
  .input(CreateLeagueScheduleInputSchema)
  .mutation(async ({ input }) => {
    const { seasonNumber, trackName, temp, raceLength, date } = input;

    try {
      await db.insert(leagueScheduleTable).values({
        seasonNumber,
        trackName,
        temp,
        raceLength,
        date: new Date(date),
      });
      return { success: true, error: null };
    } catch (error) {
      console.error("Database error while creating schedule:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create league schedule.",
      });
    }
  });

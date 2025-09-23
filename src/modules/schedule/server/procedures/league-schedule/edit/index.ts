
import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

import { EditLeagueScheduleSchema } from "./schema";

export const editLeagueScheduleProcedure = protectedProcedure
  .input(EditLeagueScheduleSchema)
  .mutation(async ({ input }) => {
    const { scheduleId, seasonNumber, trackName, temp, raceLength, date } = input;

    try {
      await db
        .update(leagueScheduleTable)
        .set({
          seasonNumber,
          trackName,
          temp,
          raceLength,
          date: new Date(date),
        })
        .where(eq(leagueScheduleTable.id, scheduleId));
      return { success: true, error: null };
    } catch (error) {
      console.error("Database error while updating schedule:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update league schedule.",
      });
    }
  });

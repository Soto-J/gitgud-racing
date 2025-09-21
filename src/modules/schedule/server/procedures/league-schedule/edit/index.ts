import { DateTime } from "luxon";

import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

import { EditLeagueScheduleSchema } from "./schema";

export const editLeagueScheduleProcedure = protectedProcedure
  .input(EditLeagueScheduleSchema)
  .mutation(async ({ input }) => {
    const { scheduleId, track, temp, raceLength, date } = input;

    const formatDate = DateTime.now().toJSDate();
    try {
      await db
        .update(leagueScheduleTable)
        .set({
          track,
          temp,
          raceLength,
          date: formatDate, // change later
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

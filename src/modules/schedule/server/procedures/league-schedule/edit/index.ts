import { z, ZodError } from "zod";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";
import { protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const editLeagueScheduleProcedure = protectedProcedure
  .input(
    z.object({
      scheduleId: z.string().min(1, "Schedule ID required."),
      track: z.string(),
      temp: z.number(),
      raceLength: z.number(),
      date: z.date(),
    }),
  )
  .mutation(async ({ input }) => {
    const { scheduleId, track, temp, raceLength, date } = input;

    try {
      await db
        .update(leagueScheduleTable)
        .set({
          track,
          temp,
          raceLength,
          date,
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

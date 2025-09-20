import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";

import { leagueScheduleTable } from "@/db/schemas";

export const getLeagueScheduleProcedure = protectedProcedure
  .input(
    z.object({
      scheduleId: z.string().min(1, "Schedule ID required."),
    }),
  )
  .query(async ({ input }) => {
    return db
      .select()
      .from(leagueScheduleTable)
      .where(eq(leagueScheduleTable.id, input.scheduleId));
  });

import { eq } from "drizzle-orm";

import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";

import { leagueScheduleTable } from "@/db/schemas";
import { GetLeagueSchedulesInputSchema } from "./schema";

export const getLeagueScheduleProcedure = protectedProcedure
  .input(GetLeagueSchedulesInputSchema)
  .query(async ({ input }) => {
    return db
      .select()
      .from(leagueScheduleTable)
      .where(eq(leagueScheduleTable.id, input.scheduleId));
  });

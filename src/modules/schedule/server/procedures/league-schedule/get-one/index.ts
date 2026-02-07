import { eq } from "drizzle-orm";

import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";

import { leagueScheduleTable } from "@/db/schemas";
import { GetLeagueScheduleSchema } from "./schema";

export const getLeagueScheduleProcedure = protectedProcedure
  .input(GetLeagueScheduleSchema)
  .query(async ({ input }) => {
    return db
      .select()
      .from(leagueScheduleTable)
      .where(eq(leagueScheduleTable.id, input.scheduleId))
      .then((row) => row[0]);
  });

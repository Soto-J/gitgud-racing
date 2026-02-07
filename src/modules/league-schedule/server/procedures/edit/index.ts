import { eq } from "drizzle-orm";

import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

import { EditLeagueScheduleSchema } from "./types/schema";

export const editProcedure = protectedProcedure
  .input(EditLeagueScheduleSchema)
  .mutation(async ({ input }) => {
    const { scheduleId, date, ...restOfInput } = input;

    return await db
      .update(leagueScheduleTable)
      .set({ ...restOfInput, date: new Date(date) })
      .where(eq(leagueScheduleTable.id, scheduleId))
      .then((row) => row[0]);
  });

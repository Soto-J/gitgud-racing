import { eq } from "drizzle-orm";

import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";
import { DeleteLeagueScheduleInputSchema } from "./types/schema";

export const deleteProcedure = protectedProcedure
  .input(DeleteLeagueScheduleInputSchema)
  .mutation(async ({ input }) => {
    return await db
      .delete(leagueScheduleTable)
      .where(eq(leagueScheduleTable.id, input.scheduleId))
      .then((row) => row[0]);
  });

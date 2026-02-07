import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";
import { asc } from "drizzle-orm";

export const getManyProcedure = protectedProcedure.query(async () => {
  return await db
    .select()
    .from(leagueScheduleTable)
    .orderBy(asc(leagueScheduleTable.date));
});

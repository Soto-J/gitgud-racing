import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

export const getLeagueSchedulesProcedure = protectedProcedure.query(
  async () => {
    return await db.select().from(leagueScheduleTable);
  },
);

import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

export const getManyProcedure = protectedProcedure.query(
  async () => {
    return await db.select().from(leagueScheduleTable);
  },
);

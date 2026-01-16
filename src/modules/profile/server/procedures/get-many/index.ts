import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable } from "@/db/schemas";

export const getAllProfilesProcedure = protectedProcedure.query(async () => {
  return await db.select().from(profileTable);
});

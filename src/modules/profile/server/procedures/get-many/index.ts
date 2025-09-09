import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable } from "@/db/schemas";

/**
 * Fetches all user profiles (admin/staff functionality)
 */
export const getAllProfilesProcedure = protectedProcedure.query(async () => {
  return await db.select().from(profileTable);
});

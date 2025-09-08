import { protectedProcedure } from "@/trpc/init";

import { getAllProfiles } from "./helper";

/**
 * Fetches all user profiles (admin/staff functionality)
 */
export const getAllProfilesProcedure = protectedProcedure.query(async () => {
  return await getAllProfiles();
});
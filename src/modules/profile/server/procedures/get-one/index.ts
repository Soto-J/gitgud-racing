import { protectedProcedure } from "@/trpc/init";

import { GetProfileInputSchema } from "./schema";
import { getCompleteProfile } from "./helper";

/**
 * Fetches a complete profile with user and license information
 */
export const getProfileProcedure = protectedProcedure
  .input(GetProfileInputSchema)
  .query(async ({ input }) => {
    return await getCompleteProfile(input.userId);
  });
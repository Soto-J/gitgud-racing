import { manageProcedure } from "@/trpc/init";

import { GetUserInputSchema } from "./schema";
import { getUserWithProfile } from "./helper";

/**
 * Fetches a single user with their profile information for management purposes
 */
export const getUserProcedure = manageProcedure
  .input(GetUserInputSchema)
  .query(async ({ input }) => {
    return await getUserWithProfile(input.userId);
  });
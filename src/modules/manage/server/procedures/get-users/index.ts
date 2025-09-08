import { manageProcedure } from "@/trpc/init";

import { GetUsersInputSchema } from "./schema";
import { getUsersWithProfiles } from "./helper";

/**
 * Fetches multiple users with pagination and search functionality for management
 */
export const getUsersProcedure = manageProcedure
  .input(GetUsersInputSchema)
  .query(async ({ input }) => {
    const { memberId, search, pageSize, page } = input;

    return await getUsersWithProfiles({
      memberId: memberId || undefined,
      search: search || undefined,
      page,
      pageSize,
    });
  });
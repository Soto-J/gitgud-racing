import { getTableColumns, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, licenseTable, user } from "@/db/schemas";

import { GetProfileInputSchema } from "./schema";

/**
 * Fetches a complete profile with user and license information
 */
export const getProfileProcedure = protectedProcedure
  .input(GetProfileInputSchema)
  .query(async ({ input }) => {
    const profileWithUser = await db
      .select({
        profile: getTableColumns(profileTable),
        licenses: getTableColumns(licenseTable),
        memberName: user.name,
      })
      .from(profileTable)
      .innerJoin(user, eq(user.id, profileTable.userId))
      .leftJoin(licenseTable, eq(licenseTable.userId, profileTable.userId))
      .where(eq(profileTable.userId, input.userId))
      .then((row) => row[0]);

    if (!profileWithUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Profile not found for user: ${input.userId}`,
      });
    }

    return profileWithUser;
  });

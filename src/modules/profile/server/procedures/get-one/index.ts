import { getTableColumns, eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { account, profileTable, user as userTable } from "@/db/schemas";

import { ProfileGetOneInputSchema } from "./types/schema";

export const getProfileProcedure = protectedProcedure
  .input(ProfileGetOneInputSchema)
  .query(async ({ input }) => {
    const [profile] = await db
      .select({
        ...getTableColumns(profileTable),
        userName: userTable.name,
        email: userTable.email,
        custId: account.accountId,
      })
      .from(profileTable)
      .innerJoin(userTable, eq(userTable.id, profileTable.userId))
      .innerJoin(
        account,
        and(
          eq(account.userId, profileTable.userId),
          eq(account.providerId, "iracing"),
        ),
      )
      .where(eq(profileTable.userId, input.userId));

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Profile not found for user: ${input.userId}`,
      });
    }

    return profile;
  });

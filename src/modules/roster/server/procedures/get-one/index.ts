import { getTableColumns, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { user as userTable, profileTable } from "@/db/schemas";

import { GetMemberInputSchema } from "./schema";

/**
 * Fetches a single member with their profile information
 */
export const getOneProcedure = protectedProcedure
  .input(GetMemberInputSchema)
  .query(async ({ input }) => {
    const results = await db
      .select({
        ...getTableColumns(userTable),
        isActive: profileTable.isActive,
      })
      .from(userTable)
      .innerJoin(profileTable, eq(profileTable.userId, userTable.id))
      .where(eq(userTable.id, input.userId));

    const user = results[0];

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Member not found",
      });
    }

    return user;
  });

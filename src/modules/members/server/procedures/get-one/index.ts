import { getTableColumns, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { user, profileTable } from "@/db/schemas";

import { GetMemberInputSchema } from "./schema";

/**
 * Fetches a single member with their profile information
 */
export const getOneProcedure = protectedProcedure
  .input(GetMemberInputSchema)
  .query(async ({ input }) => {
    const results = await db
      .select({
        ...getTableColumns(user),
        isActive: profileTable.isActive,
      })
      .from(user)
      .innerJoin(profileTable, eq(profileTable.userId, user.id))
      .where(eq(user.id, input.userId));

    const member = results[0];

    if (!member) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Member not found",
      });
    }

    return member;
  });

import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { manageProcedure } from "@/trpc/init/manage-procedure";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

import { GetUserInputSchema } from "./schema";

/**
 * Fetches a single user with their profile information for management purposes
 */
export const getUserProcedure = manageProcedure
  .input(GetUserInputSchema)
  .query(async ({ input }) => {
    const member = await db
      .select({
        id: user.id,
        name: user.name,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        createdAt: user.createdAt,
        team: profileTable.team,
        isActive: profileTable.isActive,
      })
      .from(user)
      .innerJoin(profileTable, eq(profileTable.userId, user.id))
      .where(eq(profileTable.userId, input.userId))
      .then((row) => row[0]);

    if (!member) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return member;
  });

import { getTableColumns, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, user as userTable } from "@/db/schemas";

import { ProfileGetOneInputSchema } from "./types/schema";

export const getProfileProcedure = protectedProcedure
  .input(ProfileGetOneInputSchema)
  .query(async ({ input }) => {
    const [profile] = await db
      .select({
        profile: getTableColumns(profileTable),
        memberName: userTable.name,
      })
      .from(profileTable)
      .innerJoin(userTable, eq(userTable.id, profileTable.userId))
      .where(eq(profileTable.userId, input.userId));

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Profile not found for user: ${input.userId}`,
      });
    }

    return profile;
  });

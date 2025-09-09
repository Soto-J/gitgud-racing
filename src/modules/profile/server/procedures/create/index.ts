import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

import { CreateProfileInputSchema } from "./schema";


/**
 * Creates a new profile for the authenticated user
 */
export const createProfileProcedure = protectedProcedure
  .input(CreateProfileInputSchema)
  .mutation(async ({ ctx, input }) => {
    const response = await db
      .insert(profileTable)
      .values({
        userId: input.userId,
      })
      .then((row) => row[0]);

    if (!response) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create profile",
      });
    }

    const profile = await db
      .select()
      .from(profileTable)
      .innerJoin(user, eq(user.id, profileTable.userId))
      .where(and(eq(profileTable.userId, input.userId)))
      .then((row) => row[0]);

    return profile;
  });

import { eq, and, sql } from "drizzle-orm";

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
  .mutation(async ({ input }) => {
    try {
      await db
        .insert(profileTable)
        .values({
          userId: input.userId,
        })
        .onDuplicateKeyUpdate({ set: { id: sql`id` } });

      return await db
        .select()
        .from(profileTable)
        .where(eq(profileTable.userId, input.userId))
        .then((row) => row[0]);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create profile",
      });
    }
  });

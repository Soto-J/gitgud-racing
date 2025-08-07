import z from "zod";

import { and, eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { license, profile, user } from "@/db/schema";

import { profileUpdateSchema } from "@/modules/profile/schema";

export const profileRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async () => {
    return await db.select().from(profile);
  }),

  getOne: protectedProcedure
    .input(
      z.object({
        userId: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID is missing",
        });
      }

      const profileWithUser = await db
        .select({
          ...getTableColumns(profile),
          ...getTableColumns(license),
          memberName: user.name,
        })
        .from(profile)
        .innerJoin(user, eq(profile.userId, input.userId))
        .leftJoin(license, eq(license.userId, input.userId)) // gets profile even if there's no license
        .where(eq(profile.userId, input.userId))
        .then((results) => results[0]);

      if (!profileWithUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile not found for user_id: ${input.userId}`,
        });
      }

      return profileWithUser;
    }),

  create: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [response] = await db.insert(profile).values({
        userId: input.userId,
      });

      if (!response) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Problem creating profile",
        });
      }

      const [createProfile] = await db
        .select()
        .from(profile)
        .innerJoin(user, eq(user.id, profile.userId))
        .where(
          and(
            eq(profile.userId, input.userId),
            eq(profile.userId, ctx.auth.user.id),
          ),
        );

      return createProfile;
    }),

  edit: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Update profile table
      const result = await db
        .update(profile)
        .set({
          iracingId: input.iRacingId,
          team: input.team,
          discord: input.discord,
          bio: input.bio,
        })
        .where(
          and(
            eq(profile.userId, input.userId),
            eq(profile.userId, ctx.auth.user.id),
          ),
        )
        .then((result) => result[0]);

      if (!result) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const { firstName, lastName } = input;
      const name = `${firstName.trim()} ${lastName.trim()}`;

      await db.update(user).set({ name }).where(eq(user.id, ctx.auth.user.id));

      const [editedProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.userId, input.userId));

      return editedProfile;
    }),
});

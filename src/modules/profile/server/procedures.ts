import z from "zod";

import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { profileUpdateSchema } from "@/modules/profile/schema";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx, input }) => {
    const members = await db.select().from(profile);

    return members;
  }),

  getOne: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [profileWithUser] = await db
        .select({
          ...getTableColumns(profile),
          memberName: user.name,
        })
        .from(profile)
        .innerJoin(user, eq(profile.userId, user.id))
        .where(eq(profile.userId, input.userId));

      return profileWithUser || null;
    }),

  create: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [insertResult] = await db.insert(profile).values({
        userId: input.userId,
      });

      if (!insertResult || insertResult.affectedRows === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const [createdProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.userId, input.userId));

      return createdProfile;
    }),

  edit: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [updateResult] = await db
        .update(profile)
        .set({
          iracingId: input.iRacingId,
          iRating: Number(input.iRating),
          safetyClass: input.safetyClass,
          safetyRating: Number(input.safetyRating),
          team: input.team,
          discord: input.discord,
          bio: input.bio,
        })
        .where(
          and(
            eq(profile.id, input.profileId),
            eq(profile.userId, ctx.auth.user.id),
          ),
        );

      if (!updateResult || updateResult.affectedRows === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: Problem updating profile",
        });
      }

      const { firstName, lastName } = input;
      const name = `${firstName.trim()} ${lastName.trim()}`;

      const [userUpdateResult] = await db
        .update(user)
        .set({ name })
        .where(eq(user.id, ctx.auth.user.id));

      if (!userUpdateResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
      const [editedProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.id, input.profileId));

      if (!editedProfile) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch profile",
        });
      }

      return editedProfile;
    }),
});

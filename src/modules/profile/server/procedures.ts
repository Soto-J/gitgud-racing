import z from "zod";

import { and, eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profile, user } from "@/db/schema";

import { profileUpdateSchema } from "@/modules/profile/schema";

import { authClient } from "@/lib/auth-client";

export const profileRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async () => {
    return await db.select().from(profile);
  }),

  getOne: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const [profileWithUser] = await db
        .select({
          ...getTableColumns(profile),
          memberName: user.name,
        })
        .from(profile)
        .innerJoin(user, eq(profile.userId, user.id))
        .where(eq(profile.userId, input.userId));

      if (!profileWithUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Problem fetching user profile",
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

      const createProfile = await db
        .select()
        .from(profile)
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
      const [result] = await db
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

      if (!result) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const { firstName, lastName } = input;
      const name = `${firstName.trim()} ${lastName.trim()}`;

      // Update authclient user
      const authResponse = await authClient.updateUser({ name });

      // if (!authResponse.data?.status) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "Problem updating better auth user name",
      //   });
      // }

      // Update user table
      await db.update(user).set({ name }).where(eq(user.id, ctx.auth.user.id));

      const [editedProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.id, input.profileId));

      return editedProfile;
    }),
});

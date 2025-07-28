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
      const [result] = await db.insert(profile).values({
        userId: input.userId,
      });

      if (!result) {
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

      await db.update(user).set({ name }).where(eq(user.id, ctx.auth.user.id));

      const [editedProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.id, input.profileId));

      return editedProfile;
    }),
});

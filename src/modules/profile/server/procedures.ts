import z from "zod";

import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { profileUpdateSchema } from "@/modules/profile/schema";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx, input }) => {
    return await db.select().from(profile);
  }),

  getOneOrCreate: protectedProcedure
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

      if (profileWithUser) {
        return profileWithUser;
      }

      await db.insert(profile).values({ userId: input.userId });

      const [newProfile] = await db
        .select({
          ...getTableColumns(profile),
          memberName: user.name,
        })
        .from(profile)
        .innerJoin(user, eq(profile.userId, user.id))
        .where(eq(profile.userId, input.userId));

      return newProfile;
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

      // TODO: Update authclient
      // await authClient.updateUser({
      //   image: "https://example.com/image.jpg",
      //   name,
      // });

      // Update user table
      await db.update(user).set({ name }).where(eq(user.id, ctx.auth.user.id));

      const [editedProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.id, input.profileId));

      return editedProfile;
    }),
});

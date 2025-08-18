import { and, eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { licenseTable, profileTable, user } from "@/db/schema";

import {
  CreateInsertSchema,
  EditProfileInputSchema,
  GetOneInsertSchema,
} from "@/modules/profile/schema";

export const profileRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(GetOneInsertSchema)
    .query(async ({ input }) => {
      if (!input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID is missing",
        });
      }

      const profileWithUser = await db
        .select({
          ...getTableColumns(profileTable),
          ...getTableColumns(licenseTable),
          memberName: user.name,
        })
        .from(profileTable)
        .innerJoin(user, eq(profileTable.userId, input.userId))
        .leftJoin(licenseTable, eq(licenseTable.userId, input.userId))
        .where(eq(profileTable.userId, input.userId))
        .then((results) => results[0]);

      if (!profileWithUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile not found for user_id: ${input.userId}`,
        });
      }

      return profileWithUser;
    }),

  getMany: protectedProcedure.query(async () => {
    return await db.select().from(profileTable);
  }),

  create: protectedProcedure
    .input(CreateInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const [response] = await db.insert(profileTable).values({
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
        .from(profileTable)
        .innerJoin(user, eq(user.id, profileTable.userId))
        .where(
          and(
            eq(profileTable.userId, input.userId),
            eq(profileTable.userId, ctx.auth.user.id),
          ),
        );

      return createProfile;
    }),

  edit: protectedProcedure
    .input(EditProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .update(profileTable)
        .set({
          iracingId: input.iRacingId.trim(),
          // team: input.team,
          discord: input.discord.trim(),
          bio: input.bio.trim(),
        })
        .where(
          and(
            eq(profileTable.userId, input.userId),
            eq(profileTable.userId, ctx.auth.user.id),
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
        .from(profileTable)
        .where(eq(profileTable.userId, input.userId));

      return editedProfile;
    }),
});

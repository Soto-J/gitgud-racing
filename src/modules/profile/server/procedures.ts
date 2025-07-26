import z from "zod";

import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db";
import { profile, user } from "@/db/schema";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

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
      const [createdProfile] = await db.insert(profile).values({
        userId: input.userId,
      });

      return createdProfile.insertId;
    }),
});

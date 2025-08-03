import z from "zod";
import { eq, like, and, count, desc } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";

import { db } from "@/db";
import { profile, user } from "@/db/schema";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";

export const adminRouter = createTRPCRouter({
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const [result] = await db.delete(user).where(eq(user.id, input.userId));

      return result;
    }),

  editUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const updateData = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined),
      );

      const [updateResult] = await db
        .update(profile)
        .set({ ...updateData })
        .where(eq(profile.userId, input.userId));

      return updateResult;
    }),

  getUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const [member] = await db
        .select({
          id: user.id,
          name: user.name,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          createdAt: user.createdAt,
          team: profile.team,
          isActive: profile.isActive,
        })
        .from(user)
        .innerJoin(profile, eq(profile.id, user.id))
        .where(eq(profile.userId, input.userId));

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return member;
    }),

  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        memberId: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { memberId, search, pageSize, page } = input;

      const members = await db
        .select({
          id: user.id,
          name: user.name,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          createdAt: user.createdAt,
          team: profile.team,
          isActive: profile.isActive,
        })
        .from(user)
        .innerJoin(profile, eq(profile.userId, user.id))
        .where(
          and(
            memberId ? eq(user.id, memberId) : undefined,
            search ? like(user.name, `%${search}`) : undefined,
          ),
        )
        .orderBy(desc(user.createdAt), desc(user.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      if (!members) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Users not found" });
      }

      const [total] = await db
        .select({ count: count() })
        .from(user)
        .where(
          and(
            memberId ? eq(user.id, memberId) : undefined,
            search ? like(user.name, `%${search}%`) : undefined,
          ),
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        members,
        total: total.count,
        totalPages,
      };
    }),
});

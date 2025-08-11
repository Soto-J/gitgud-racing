import z from "zod";

import { count, desc, eq, like, and, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { profile, user } from "@/db/schema";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";

export const membersRouter = createTRPCRouter({
  getMany: protectedProcedure
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
      const { memberId, page, pageSize, search } = input;

      const members = await db
        .select({
          ...getTableColumns(user),
          isActive: profile.isActive,
        })
        .from(user)
        .innerJoin(profile, eq(profile.userId, user.id))
        .where(
          and(
            memberId ? eq(user.id, memberId) : undefined,
            search ? like(user.name, `%${search}%`) : undefined,
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

      const [totalActive] = await db
        .select({ count: count() })
        .from(user)
        .innerJoin(profile, eq(profile.userId, user.id))
        .where(
          and(
            memberId ? eq(user.id, memberId) : undefined,
            search ? like(user.name, `%${search}%`) : undefined,
            eq(profile.isActive, true),
          ),
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        members,
        totalActive: totalActive.count,
        total: total.count,
        totalPages,
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [member] = await db
        .select({
          ...getTableColumns(user),
          isActive: profile.isActive,
        })
        .from(user)
        .innerJoin(profile, eq(profile.userId, user.id))
        .where(eq(user.id, input.id));

      return member;
    }),
});

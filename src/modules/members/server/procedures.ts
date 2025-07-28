import z from "zod";

import { count, desc, eq, like, and } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

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
    .query(async ({ ctx, input }) => {
      const { memberId, page, pageSize, search } = input;

      const members = await db
        .select()
        .from(user)
        .where(
          and(
            memberId ? eq(user.id, memberId) : undefined,
            search ? like(user.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(user.createdAt), desc(user.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

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

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [member] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id));

      return member;
    }),
});

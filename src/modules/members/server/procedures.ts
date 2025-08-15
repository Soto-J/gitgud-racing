import { count, desc, eq, like, and, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profile, user } from "@/db/schema";

import {
  GetManyInputSchema,
  GetOneInputSchema,
} from "@/modules/members/schema";

export const membersRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(GetOneInputSchema)
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

  getMany: protectedProcedure
    .input(GetManyInputSchema)
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
});

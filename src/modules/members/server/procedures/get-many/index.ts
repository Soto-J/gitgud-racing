import { and, count, desc, eq, getTableColumns, like } from "drizzle-orm";

import { db } from "@/db";
import { protectedProcedure } from "@/trpc/init";

import { profileTable, user } from "@/db/schemas";

import { GetMembersInputSchema } from "./schema";

/**
 * Fetches multiple members with pagination and search functionality
 * Includes statistics for total members and active members
 */
export const getManyProcedure = protectedProcedure
  .input(GetMembersInputSchema)
  .query(async ({ input }) => {
    const { page, pageSize, search } = input;

    const searchFilter = search ? like(user.name, `%${search}%`) : undefined;

    const [users, [total], [totalActive]] = await Promise.all([
      db
        .select({
          ...getTableColumns(user),
          isActive: profileTable.isActive,
        })
        .from(user)
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
        .where(searchFilter)
        .orderBy(desc(user.createdAt), desc(user.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize),

      db
        .select({ count: count() })
        .from(user)
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
        .where(searchFilter),

      db
        .select({ count: count() })
        .from(user)
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
        .where(and(searchFilter, eq(profileTable.isActive, true))),
    ]);

    const totalPages = Math.ceil(total.count / pageSize);

    if (users.length === 0) {
      return {
        users: [],
        totalActive: 0,
        total: 0,
        totalPages,
      };
    }

    return {
      users,
      totalActive: totalActive.count,
      total: total.count,
      totalPages,
    };
  });

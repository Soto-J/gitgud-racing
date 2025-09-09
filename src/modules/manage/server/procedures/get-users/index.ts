import { and, count, desc, eq, like } from "drizzle-orm";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

import { manageProcedure } from "@/trpc/init";

import { GetUsersInputSchema } from "./schema";

/**
 * Fetches multiple users with pagination and search functionality for management
 */
export const getUsersProcedure = manageProcedure
  .input(GetUsersInputSchema)
  .query(async ({ input }) => {
    const { search, pageSize, page } = input;

    const searchClause = and(
      search ? like(user.name, `%${search}%`) : undefined,
    );

    const members = await db
      .select({
        id: user.id,
        name: user.name,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        createdAt: user.createdAt,
        team: profileTable.team,
        isActive: profileTable.isActive,
      })
      .from(user)
      .innerJoin(profileTable, eq(profileTable.userId, user.id))
      .where(searchClause)
      .orderBy(desc(user.createdAt), desc(user.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const total = await db
      .select({ count: count() })
      .from(user)
      .innerJoin(profileTable, eq(profileTable.userId, user.id))
      .where(searchClause)
      .then((row) => row[0]);

    const totalPages = Math.ceil(total.count / pageSize);

    return {
      members,
      total: total.count,
      totalPages,
    };
  });

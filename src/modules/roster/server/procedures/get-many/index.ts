import { and, count, desc, eq, getTableColumns, like } from "drizzle-orm";

import { db } from "@/db";
import { protectedProcedure } from "@/trpc/init";

import { profileTable, user as userTable } from "@/db/schemas";
import { RosterGetManyInputSchema } from "./types/schema";

export const getManyProcedure = protectedProcedure
  .input(RosterGetManyInputSchema)
  .query(async ({ input }) => {
    const { page, pageSize, search } = input;

    const searchFilter = search
      ? like(userTable.name, `%${search}%`)
      : undefined;

    const [users, [total], [totalActive]] = await Promise.all([
      db
        .select({
          ...getTableColumns(userTable),
          isActive: profileTable.isActive,
          discord: profileTable.discord,
          team: profileTable.team,
        })
        .from(userTable)
        .innerJoin(profileTable, eq(profileTable.userId, userTable.id))
        .where(searchFilter)
        .orderBy(desc(userTable.createdAt), desc(userTable.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize),

      db
        .select({ count: count() })
        .from(userTable)
        .innerJoin(profileTable, eq(profileTable.userId, userTable.id))
        .where(searchFilter),

      db
        .select({ count: count() })
        .from(userTable)
        .innerJoin(profileTable, eq(profileTable.userId, userTable.id))
        .where(and(searchFilter, eq(profileTable.isActive, true))),
    ]);

    const totalPages = Math.ceil(total.count / pageSize);

    return {
      users,
      totalActive: totalActive.count,
      total: total.count,
      totalPages,
    };
  });

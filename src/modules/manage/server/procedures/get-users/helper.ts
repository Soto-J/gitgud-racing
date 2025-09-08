import { like, and, count, desc, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

export type UserWithProfile = {
  id: string;
  name: string;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  team: string | null;
  isActive: boolean;
};

/**
 * Builds search clause for user filtering by ID and name
 */
function buildUserSearchClause(memberId?: string, search?: string) {
  return and(
    memberId ? eq(user.id, memberId) : undefined,
    search ? like(user.name, `%${search}%`) : undefined,
  );
}

/**
 * Fetches multiple users with their profile information using pagination and filtering
 *
 * @param filters - Object containing search and pagination parameters
 * @returns Promise resolving to paginated user list with metadata
 */
export async function getUsersWithProfiles(filters: {
  memberId?: string;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const { memberId, search, page, pageSize } = filters;

  const searchClause = buildUserSearchClause(memberId, search);

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

  if (!members?.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No users found",
    });
  }

  const [total] = await db
    .select({ count: count() })
    .from(user)
    .innerJoin(profileTable, eq(profileTable.userId, user.id))
    .where(searchClause);

  const totalPages = Math.ceil(total.count / pageSize);

  return {
    members,
    total: total.count,
    totalPages,
  };
}
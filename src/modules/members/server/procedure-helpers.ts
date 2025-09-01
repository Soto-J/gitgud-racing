import { count, desc, eq, like, and, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schema";

// =============================================================================
// TYPES
// =============================================================================

export type MemberWithProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type MemberSearchFilters = {
  memberId?: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type MemberListResult = {
  members: MemberWithProfile[];
  totalActive: number;
  total: number;
  totalPages: number;
};

// =============================================================================
// DATABASE QUERY HELPERS
// =============================================================================

/**
 * Fetches a single member with their profile information
 * 
 * @param memberId - The member ID to fetch
 * @returns Promise resolving to member with profile data
 * @throws TRPCError if member is not found
 * 
 * @example
 * ```typescript
 * const member = await getMemberWithProfile("user_123");
 * console.log(member.name, member.isActive);
 * ```
 */
export async function getMemberWithProfile(memberId: string): Promise<MemberWithProfile> {
  const [member] = await db
    .select({
      ...getTableColumns(user),
      isActive: profileTable.isActive,
    })
    .from(user)
    .innerJoin(profileTable, eq(profileTable.userId, user.id))
    .where(eq(user.id, memberId));

  if (!member) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Member not found",
    });
  }

  return member;
}

/**
 * Fetches multiple members with pagination and search functionality
 * 
 * @param filters - Search and pagination parameters
 * @returns Promise resolving to paginated member list with statistics
 * 
 * @example
 * ```typescript
 * const result = await getMembersWithProfiles({
 *   search: "john",
 *   page: 1,
 *   pageSize: 10
 * });
 * console.log(result.members, result.total, result.totalActive);
 * ```
 */
export async function getMembersWithProfiles(filters: MemberSearchFilters): Promise<MemberListResult> {
  const { memberId, page, pageSize, search } = filters;
  
  const searchClause = buildMemberSearchClause(memberId, search);

  // Fetch members with pagination
  const members = await db
    .select({
      ...getTableColumns(user),
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
      message: "No members found" 
    });
  }

  // Get total count
  const [total] = await db
    .select({ count: count() })
    .from(user)
    .innerJoin(profileTable, eq(profileTable.userId, user.id))
    .where(searchClause);

  // Get active members count
  const [totalActive] = await db
    .select({ count: count() })
    .from(user)
    .innerJoin(profileTable, eq(profileTable.userId, user.id))
    .where(
      and(
        searchClause,
        eq(profileTable.isActive, true)
      )
    );

  const totalPages = Math.ceil(total.count / pageSize);

  return {
    members,
    totalActive: totalActive.count,
    total: total.count,
    totalPages,
  };
}

// =============================================================================
// SEARCH AND FILTER HELPERS
// =============================================================================

/**
 * Builds search clause for member filtering by ID and name
 * 
 * @param memberId - Optional member ID filter
 * @param search - Optional name search term
 * @returns Drizzle ORM where clause or undefined for no filtering
 */
function buildMemberSearchClause(memberId?: string, search?: string) {
  return and(
    memberId ? eq(user.id, memberId) : undefined,
    search ? like(user.name, `%${search}%`) : undefined,
  );
}

/**
 * Validates member search parameters
 * 
 * @param filters - Search filters to validate
 * @throws TRPCError if validation fails
 */
export function validateMemberSearchFilters(filters: MemberSearchFilters): void {
  if (filters.page < 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Page must be greater than 0",
    });
  }

  if (filters.pageSize < 1 || filters.pageSize > 100) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Page size must be between 1 and 100",
    });
  }

  if (filters.search && filters.search.trim().length < 2) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Search term must be at least 2 characters",
    });
  }
}
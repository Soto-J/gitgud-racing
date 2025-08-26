import { eq, like, and, count, desc } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, manageProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, user } from "@/db/schema";

import {
  DeleteUserInputSchema,
  GetUserInputSchema,
  GetUsersInputSchema,
  ProfileEditUserInputSchema,
} from "@/modules/manage/schema";

export const manageRouter = createTRPCRouter({
  getUser: manageProcedure
    .input(GetUserInputSchema)
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
          team: profileTable.team,
          isActive: profileTable.isActive,
        })
        .from(user)
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
        .where(eq(profileTable.userId, input.userId));

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return member;
    }),

  getUsers: manageProcedure
    .input(GetUsersInputSchema)
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
          team: profileTable.team,
          isActive: profileTable.isActive,
        })
        .from(user)
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
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
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
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

  editUser: manageProcedure
    .input(ProfileEditUserInputSchema)
    .mutation(async ({ ctx, input }) => {
      const unauthorized =
        ctx.auth.user?.role === "staff" &&
        (input.role === "admin" || input.role === "staff");

      if (unauthorized) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only an admin can edit a staff",
        });
      }

      const [profileResHeader] = await db
        .update(profileTable)
        .set({
          team: input.team,
          isActive: input.isActive,
        })
        .where(eq(profileTable.userId, input.userId));

      if (profileResHeader.affectedRows === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }

      const [userResHeader] = await db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, input.userId));

      if (userResHeader.affectedRows === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }

      const [updatedMember] = await db
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
        .where(eq(profileTable.userId, input.userId));

      return updatedMember;
    }),

  deleteUser: manageProcedure
    .input(DeleteUserInputSchema)
    .mutation(async ({ ctx, input }) => {
      const unauthorized =
        ctx.auth.user?.role === "staff" &&
        (input.role === "admin" || input.role === "staff");

      if (unauthorized) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only an admin can edit a staff",
        });
      }

      if (ctx.auth.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete self",
        });
      }

      const [memberToDelete] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId));

      if (!memberToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed to get member",
        });
      }

      if (memberToDelete.role === "admin") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed to get member",
        });
      }

      const [result] = await db.delete(user).where(eq(user.id, input.userId));

      return result;
    }),
});

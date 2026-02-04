import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { adminProcedure } from "@/trpc/init/admin-procedure";

import { db } from "@/db";
import { profileTable, user as userTable } from "@/db/schemas";

import { EditUserInputSchema } from "./types/schema";

export const editUserProcedure = adminProcedure
  .input(EditUserInputSchema)
  .mutation(async ({ input }) => {
    const { userId, role, team, isActive } = input;

    return await db.transaction(async (tx) => {
      const [profileResult] = await tx
        .update(profileTable)
        .set({ team, isActive })
        .where(eq(profileTable.userId, input.userId));

      const [userResult] = await tx
        .update(userTable)
        .set({ role })
        .where(eq(userTable.id, userId));

      if (profileResult.affectedRows === 0 || userResult.affectedRows === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User not found" });
      }
    });
  });

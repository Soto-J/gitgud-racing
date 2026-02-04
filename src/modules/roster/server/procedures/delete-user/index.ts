import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { adminProcedure } from "@/trpc/init/admin-procedure";

import { db } from "@/db";
import { user as userTable } from "@/db/schemas";

import { DeleteUserInputSchema } from "./types/schema";

export const deleteUserProcedure = adminProcedure
  .input(DeleteUserInputSchema)
  .mutation(async ({ input }) => {
    const { userId } = input;

    const [result] = await db.delete(userTable).where(eq(userTable.id, userId));

    if (result.affectedRows === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
  });

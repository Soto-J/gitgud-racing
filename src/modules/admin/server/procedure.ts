import z from "zod";
import { eq } from "drizzle-orm";

import { adminProcedure, createTRPCRouter } from "@/trpc/init";

import { db } from "@/db";
import { profile, user } from "@/db/schema";

export const adminRouter = createTRPCRouter({
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const [result] = await db.delete(user).where(eq(user.id, input.userId));

      return result;
    }),

  editUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const updateData = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined),
      );

      const [updateResult] = await db
        .update(profile)
        .set({ ...updateData })
        .where(eq(profile.userId, input.userId));

      return updateResult;
    }),
});

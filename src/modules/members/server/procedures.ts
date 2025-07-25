import z from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const membersRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx, input }) => {
    const members = await db.select().from(user);

    return members;
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [member] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id));

      return member;
    }),
});

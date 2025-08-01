import { cache } from "react";
import { headers } from "next/headers";

import { initTRPC, TRPCError } from "@trpc/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

import { auth } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const userRoleResult = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, ctx.auth.user.id));

  if (!userRoleResult.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Could not retrieve user role",
    });
  }

  const [{ role }] = userRoleResult;

  if (role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

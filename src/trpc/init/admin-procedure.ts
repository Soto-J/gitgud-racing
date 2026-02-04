import { TRPCError } from "@trpc/server";
import { protectedProcedure } from ".";

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.auth.user?.role === "user" || ctx.auth.user?.role === "guest") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

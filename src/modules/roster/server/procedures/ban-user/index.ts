import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { adminProcedure } from "@/trpc/init/admin-procedure";

import { db } from "@/db";
import { user as userTable } from "@/db/schemas";
import { BanUserInputSchema } from "./types/schema";

export const banUserProcedure = adminProcedure
  .input(BanUserInputSchema)
  .mutation(async ({ input }) => {});

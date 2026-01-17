import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

import { protectedProcedure } from "@/trpc/init";

export const hasIracingConnectionProcedure = protectedProcedure.query(
  async ({ ctx }) => {
    const account = await db
      .select()
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, ctx.auth.user.id),
          eq(accountTable.providerId, "iracing"),
        ),
      )
      .limit(1);

    return { isConnected: !!account.length };
  },
);

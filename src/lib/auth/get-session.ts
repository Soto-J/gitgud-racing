import { cache } from "react";
import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth } from ".";
import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return null;

  const [iracingAccount] = await db
    .select()
    .from(accountTable)
    .where(
      and(
        eq(accountTable.userId, session.user.id),
        eq(accountTable.providerId, "iracing"),
      ),
    )
    .limit(1);

  const tokenIsExpired =
    !!iracingAccount?.accessTokenExpiresAt &&
    iracingAccount.accessTokenExpiresAt < new Date();

  if (tokenIsExpired) return null;

  return session;
});

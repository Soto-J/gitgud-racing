import { cache } from "react";
import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth } from ".";
import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  // const [iracingAccount] = await db
  //   .select()
  //   .from(accountTable)
  //   .where(
  //     and(
  //       eq(accountTable.userId, session.user.id),
  //       eq(accountTable.providerId, "iracing"),
  //     ),
  //   )
  //   .limit(1);

  // // If user has an iRacing account, check if refresh token is expired
  // // (access token expiry is handled by iracingProcedure which refreshes silently)
  // // If no iRacing account, let them through - they may have signed up via email/Google
  // if (iracingAccount) {
  //   const refreshTokenExpired =
  //     !iracingAccount.refreshToken ||
  //     (!!iracingAccount.refreshTokenExpiresAt &&
  //       iracingAccount.refreshTokenExpiresAt < new Date());

  //   if (refreshTokenExpired) return null;
  // }

  return session;
});

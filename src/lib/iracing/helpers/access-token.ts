import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { account as accountTable, user as userTable } from "@/db/schemas";

import { refreshIracingAccessToken } from "@/lib/auth/utils/iracing-oauth-helpers";

const MS_10_MINUTES = 10 * 60 * 1_000;

export async function getAccessToken() {
  return await db.transaction(async (tx) => {
    const [adminAccount] = await tx
      .select({
        id: accountTable.id,
        accessToken: accountTable.accessToken,
        refreshToken: accountTable.refreshToken,
        accessTokenExpiresAt: accountTable.accessTokenExpiresAt,
      })
      .from(accountTable)
      .for("update")
      .innerJoin(userTable, eq(accountTable.userId, userTable.id))
      .where(
        and(
          eq(accountTable.providerId, "iracing"),
          eq(userTable.role, "admin"),
        ),
      )
      .limit(1);

    if (!adminAccount) {
      throw new Error("[AccessToken] No admin iRacing account found");
    }

    const { id, accessToken, refreshToken, accessTokenExpiresAt } =
      adminAccount;

    if (!refreshToken) {
      throw new Error("[AccessToken] Admin account has no refresh token");
    }

    const isTokenValid =
      accessToken &&
      accessTokenExpiresAt &&
      accessTokenExpiresAt.getTime() > Date.now() + MS_10_MINUTES;

    if (isTokenValid) {
      console.log("[AccessToken] Using existing access token");
      return accessToken;
    }

    console.log("[AccessToken] Refreshing access token...");
    const newTokens = await refreshIracingAccessToken(refreshToken);

    // Update the account with new tokens
    await tx
      .update(accountTable)
      .set({
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        accessTokenExpiresAt: new Date(
          Date.now() + newTokens.expires_in * 1_000,
        ),
      })
      .where(eq(accountTable.id, id));

    console.log("[AccessToken] Access token refreshed successfully");
    return newTokens.access_token;
  });
}

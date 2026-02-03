import crypto from "crypto";

import env from "@/env";

import type { TokenResponse } from "@/lib/auth/types";
import { TokenRespnseSchema } from "@/lib/auth/types/schema";

import { RefreshTokenError, TokenErrorCode } from "@/trpc/errors";
import { IRACING_REFRESH_TOKEN_URL } from "@/constants";

export async function refreshIracingAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const response = await fetch(IRACING_REFRESH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.IRACING_CLIENT_ID,
      client_secret: maskIRacingSecret(
        env.IRACING_AUTH_SECRET,
        env.IRACING_CLIENT_ID,
      ),
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as {
        error?: string;
        error_description?: string;
      };

      throw new RefreshTokenError(
        payload.error_description ?? "Failed to refresh iRacing token",
        (payload.error?.toUpperCase() as TokenErrorCode) ?? "SERVER_ERROR",
      );
    }

    const text = await response.text();
    throw new RefreshTokenError(
      text || `Failed to refresh iRacing token`,
      "SERVER_ERROR",
    );
  }

  const payload = await response.json();
  return TokenRespnseSchema.parse(payload);
}

export function maskIRacingSecret(secret: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(secret + identifier.trim().toLowerCase())
    .digest("base64");
}

import { TRPCError } from "@trpc/server";
import crypto from "crypto";

import type { TokenResponse } from "../types";
import { TokenRespnseSchema } from "../types/schemas";
import env from "@/env";

export function maskIRacingSecret(secret: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(secret + identifier.trim().toLowerCase())
    .digest("base64");
}

export async function refreshIracingAccessToken(
  refreshToken: string | null,
): Promise<TokenResponse> {
  if (!refreshToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "iRacing session expired. Please re-authenticate.",
    });
  }

  const response = await fetch("https://oauth.iracing.com/oauth2/token", {
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
    const text = await response.text();
    throw new Error(`Failed to refresh iRacing token: ${text}`);
  }

  const payload = await response.json();

  return TokenRespnseSchema.parse(payload);
}

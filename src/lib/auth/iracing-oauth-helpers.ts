import { TRPCError } from "@trpc/server";
import crypto from "crypto";

import { TokenResponse } from "./types";
import { TokenRespnseSchema } from "./types/schemas";

/**
 * Masks the iRacing client secret according to their OAuth specification.
 * The masking algorithm:
 * 1. Normalizes the identifier (trim and lowercase)
 * 2. Concatenates secret + normalized_identifier
 * 3. Hashes with SHA-256
 * 4. Returns base64 encoded hash
 *
 * @param secret - The client secret
 * @param identifier - The client_id
 * @returns Base64 encoded SHA-256 hash
 */
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

  const res = await fetch("https://oauth.iracing.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.IRACING_CLIENT_ID}:${process.env.IRACING_CLIENT_SECRET}`,
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh iRacing token: ${text}`);
  }

  return TokenRespnseSchema.parse(res.json());
}

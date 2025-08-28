import CryptoJS from "crypto-js";
import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { iracingAuthTable } from "@/db/schema";

import { COOKIE_EXPIRES_IN_MS, IRACING_URL, API_TIMEOUT_MS } from "./config";

/**
 * Gets or refreshes the iRacing authentication code
 *
 * This function manages iRacing authentication by checking for a cached auth code
 * and refreshing it if necessary. iRacing auth tokens expire after ~12 hours,
 * so this function handles both cached retrieval and fresh authentication.
 *
 * @returns {Promise<string>} Valid iRacing authentication code
 *
 * @throws {TRPCError}
 * - INTERNAL_SERVER_ERROR: Missing environment variables or auth failure
 * - UNAUTHORIZED: Invalid credentials or no auth cookie received
 *
 * @example
 * ```typescript
 * const authCode = await getOrRefreshAuthCode();
 * // Use authCode for subsequent iRacing API calls
 * ```
 */
export const getOrRefreshAuthCode = async (): Promise<string> => {
  const IRACING_EMAIL = process.env?.IRACING_EMAIL;
  const IRACING_PASSWORD = process.env?.IRACING_PASSWORD;

  if (!IRACING_PASSWORD) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_PASSWORD`,
    });
  }
  if (!IRACING_EMAIL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_EMAIL`,
    });
  }

  const iracingAuthInfo = await db
    .select()
    .from(iracingAuthTable)
    .then((value) => value[0]);

  // Check if cached auth is still valid
  if (iracingAuthInfo?.expiresAt && iracingAuthInfo.expiresAt > new Date()) {
    const timeLeft = iracingAuthInfo.expiresAt.getTime() - Date.now();
    console.log(
      `Using cached iRacing auth (expires in ${Math.round(timeLeft / 1000 / 60)} minutes)`,
    );

    return iracingAuthInfo.authCode;
  }

  // Refresh iRacing authcode
  console.log("Refreshing iRacing auth...");
  try {
    const hashedPassword = CryptoJS.enc.Base64.stringify(
      CryptoJS.SHA256(IRACING_PASSWORD + IRACING_EMAIL.toLowerCase()),
    );

    if (!hashedPassword) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to hash password.",
      });
    }

    const response = await fetch(`${IRACING_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: IRACING_EMAIL,
        password: hashedPassword,
      }),
      credentials: "include", // Important for cookies
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to authenticate iRacing: ${response.status}`,
      });
    }

    const authCode = response.headers
      .get("set-cookie")
      ?.match(/authtoken_members=([^;]+)/)?.[1];

    if (!authCode) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No valid auth cookie received from iRacing",
      });
    }

    await db
      .insert(iracingAuthTable)
      .values({
        authCode,
        expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
      })
      .onDuplicateKeyUpdate({
        set: {
          authCode,
          expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
        },
      });

    return authCode;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
};

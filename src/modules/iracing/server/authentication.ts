import CryptoJS from "crypto-js";
import { DateTime } from "luxon";

import { TRPCError } from "@trpc/server";

import { gt } from "drizzle-orm";

import { db } from "@/db";
import { iracingAuthTable } from "@/db/schemas";

import env from "@/env";

import { IRACING_URL } from "@/constants";
import { API_TIMEOUT_MS } from "@/modules/iracing/constants";

/**
 * Rate limiting for iRacing authentication requests
 */
let lastAuthAttempt = 0;
const MIN_AUTH_INTERVAL = 30000; // 30 seconds between auth attempts

/**
 * Promise-based lock to prevent concurrent authentication requests
 */
let authPromise: Promise<string> | null = null;

/**
 * Utility function to wait for a specified duration
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
 * - TOO_MANY_REQUESTS: Rate limit exceeded
 *
 * @example
 * ```typescript
 * const authCode = await getOrRefreshAuthCode();
 * // Use authCode for subsequent iRacing API calls
 * ```
 */
export const getOrRefreshAuthCode = async (): Promise<string> => {
  if (authPromise) {
    console.log("Auth request already in progress, waiting...");
    return authPromise;
  }

  const iracingAuthInfo = await db
    .select()
    .from(iracingAuthTable)
    .where(gt(iracingAuthTable.expiresAt, DateTime.utc().toJSDate()))
    .then((value) => value[0]);

  const timeLeft = iracingAuthInfo
    ? DateTime.fromJSDate(iracingAuthInfo.expiresAt).diffNow().minutes
    : 0;

  if (timeLeft > 0) {
    console.log(
      `Using cached iRacing auth (expires in ${Math.round(timeLeft)} minutes)`,
    );

    return iracingAuthInfo.authCode;
  }

  // Create a promise for this authentication attempt
  authPromise = (async (): Promise<string> => {
    try {
      // Check rate limiting before attempting authentication
      const now = Date.now();
      const timeSinceLastAuth = now - lastAuthAttempt;

      if (timeSinceLastAuth < MIN_AUTH_INTERVAL) {
        const waitTime = MIN_AUTH_INTERVAL - timeSinceLastAuth;
        console.log(
          `Rate limiting: waiting ${Math.round(waitTime / 1000)}s before auth attempt...`,
        );
        await sleep(waitTime);
      }

      lastAuthAttempt = DateTime.now().millisecond;

      // Refresh iRacing authcode
      console.log("Refreshing iRacing auth...");

      const hashedPassword = CryptoJS.enc.Base64.stringify(
        CryptoJS.SHA256(env.IRACING_PASSWORD + env.IRACING_EMAIL.toLowerCase()),
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
          email: env.IRACING_EMAIL,
          password: hashedPassword,
        }),
        credentials: "include", // Important for cookies
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "Invalid iRacing credentials. Please check your IRACING_EMAIL and IRACING_PASSWORD.",
          });
        }

        if (response.status === 429) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "iRacing rate limit exceeded. Please wait a moment before trying again.",
          });
        }

        if (response.status >= 500) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "iRacing authentication service is temporarily unavailable. Please try again later.",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to authenticate with iRacing: ${response.status} ${response.statusText}`,
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
          userId: env.MY_USER_ID,
          authCode,
          expiresAt: DateTime.utc().plus({ hours: 1 }).toJSDate(),
        })
        .onDuplicateKeyUpdate({
          set: {
            authCode: authCode,
            expiresAt: DateTime.utc().plus({ hours: 1 }).toJSDate(),
          },
        });

      console.log(`Successfully stored auth code (expires in 60 minutes)`);
      return authCode;
    } finally {
      // Clear the promise when done (success or failure)
      authPromise = null;
    }
  })();

  return authPromise;
};

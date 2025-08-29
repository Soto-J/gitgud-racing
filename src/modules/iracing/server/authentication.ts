import CryptoJS from "crypto-js";

import { DateTime } from "luxon";

import { TRPCError } from "@trpc/server";

import { gt, and } from "drizzle-orm";

import { db } from "@/db";

import { iracingAuthTable } from "@/db/schema";

import { IRACING_URL, API_TIMEOUT_MS } from "./config";

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
  // If there's already an auth request in progress, wait for it
  if (authPromise) {
    console.log("Auth request already in progress, waiting...");
    return authPromise;
  }

  const IRACING_EMAIL = process.env?.IRACING_EMAIL;
  const IRACING_PASSWORD = process.env?.IRACING_PASSWORD;
  const MY_USER_ID = process.env?.MY_USER_ID;

  if (!IRACING_PASSWORD) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_PASSWORD`,
    });
  } else if (!IRACING_EMAIL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_EMAIL`,
    });
  } else if (!MY_USER_ID) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: MY_USER_ID`,
    });
  }

  const iracingAuthInfo = await db
    .select()
    .from(iracingAuthTable)
    .where(
      and(
        gt(
          iracingAuthTable.updatedAt,
          DateTime.now().minus({ hour: 1 }).toJSDate(), // Resets hourly
        ),
        gt(iracingAuthTable.expiresAt, new Date()),
      ),
    )
    .then((value) => value[0]);

  if (iracingAuthInfo?.expiresAt) {
    const timeLeft = DateTime.fromJSDate(iracingAuthInfo.expiresAt).diffNow();

    console.log(
      `Using cached iRacing auth (expires in ${Math.round(timeLeft.minutes)} minutes)`,
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
        console.log(`Rate limiting: waiting ${Math.round(waitTime / 1000)}s before auth attempt...`);
        await sleep(waitTime);
      }
      
      lastAuthAttempt = Date.now();

      // Refresh iRacing authcode
      console.log("Refreshing iRacing auth...");

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

      await db.insert(iracingAuthTable).values({
        userId: MY_USER_ID,
        authCode,
        expiresAt: DateTime.now().plus({ hours: 1 }).toJSDate(),
      }).onDuplicateKeyUpdate({
        set: {
          authCode: authCode,
          expiresAt: DateTime.now().plus({ hours: 1 }).toJSDate(),
          updatedAt: new Date(),
        }
      });

      console.log(
        `Successfully stored auth code (expires in ${DateTime.now().plus({ hours: 1 }).minute} minutes)`,
      );
      return authCode;
    } finally {
      // Clear the promise when done (success or failure)
      authPromise = null;
    }
  })();

  return authPromise;
};

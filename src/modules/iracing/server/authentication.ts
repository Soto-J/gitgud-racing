import CryptoJS from "crypto-js";
import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { iracingAuthTable } from "@/db/schema";

import { COOKIE_EXPIRES_IN_MS, IRACING_URL, API_TIMEOUT_MS } from "./config";

// In-memory cache to prevent concurrent auth requests
let authPromise: Promise<string> | null = null;
let lastAuthAttempt = 0;
const AUTH_RETRY_DELAY = 5000; // 5 seconds between failed attempts

/**
 * Validates iRacing environment configuration
 *
 * @returns {boolean} True if configuration is valid
 * @throws {TRPCError} If configuration is invalid
 */
export const validateIRacingConfig = (): boolean => {
  const IRACING_EMAIL = process.env?.IRACING_EMAIL;
  const IRACING_PASSWORD = process.env?.IRACING_PASSWORD;

  if (!IRACING_EMAIL) {
    console.error(
      "iRacing configuration error: IRACING_EMAIL environment variable is missing",
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing required environment variable: IRACING_EMAIL",
    });
  }

  if (!IRACING_PASSWORD) {
    console.error(
      "iRacing configuration error: IRACING_PASSWORD environment variable is missing",
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing required environment variable: IRACING_PASSWORD",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(IRACING_EMAIL)) {
    console.error(
      "iRacing configuration error: IRACING_EMAIL has invalid format:",
      IRACING_EMAIL,
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid email format in IRACING_EMAIL environment variable",
    });
  }

  console.log("iRacing configuration validated successfully");
  return true;
};

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
  // Rate limiting: prevent too many failed auth attempts
  // const now = Date.now();
  // if (lastAuthAttempt > 0 && now - lastAuthAttempt < AUTH_RETRY_DELAY) {
  //   const waitTime = AUTH_RETRY_DELAY - (now - lastAuthAttempt);
  //   console.log(`Rate limiting: waiting ${waitTime}ms before retry`);
  //   await new Promise((resolve) => setTimeout(resolve, waitTime));
  // }

  // Create the auth promise and cache it
  
  return performAuthentication();

  try {
    const result = await authPromise;
    authPromise = null; // Clear on success
    return result;
  } catch (error) {
    authPromise = null; // Clear on failure
    lastAuthAttempt = Date.now();
    throw error;
  }
};

/**
 * Internal function that performs the actual authentication
 */
const performAuthentication = async (): Promise<string> => {
  const IRACING_EMAIL = process.env?.IRACING_EMAIL;
  const IRACING_PASSWORD = process.env?.IRACING_PASSWORD;

  if (!IRACING_PASSWORD) {
    console.error(
      "iRacing authentication error: IRACING_PASSWORD environment variable is missing",
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_PASSWORD`,
    });
  }
  if (!IRACING_EMAIL) {
    console.error(
      "iRacing authentication error: IRACING_EMAIL environment variable is missing",
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_EMAIL`,
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(IRACING_EMAIL)) {
    console.error(
      "iRacing authentication error: IRACING_EMAIL has invalid format",
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid email format in IRACING_EMAIL environment variable",
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
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error("iRacing authentication failed:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorBody,
        });
      } catch (bodyError) {
        console.error(
          "Failed to read authentication error response:",
          bodyError,
        );
      }

      // Provide more specific error messages based on status codes
      if (response.status === 401 || response.status === 403) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Invalid iRacing credentials. Please check your IRACING_EMAIL and IRACING_PASSWORD.",
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

    console.log("HERRO!!!!!!!!");
    // Delete existing auth records and insert new one (single auth record approach)
    await db.delete(iracingAuthTable);

    await db.insert(iracingAuthTable).values({
      authCode,
      expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
    });

    console.log(
      `Successfully stored auth code (expires in ${COOKIE_EXPIRES_IN_MS / 1000 / 60} minutes)`,
    );
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

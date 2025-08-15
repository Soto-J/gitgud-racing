import CryptoJS from "crypto-js";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { IRACING_URL, COOKIE_EXPIRES_IN_MS } from "@/constants";

import { db } from "@/db";
import { iracingAuth } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const requiredEnvVars = {
  email: process.env.IRACING_EMAIL,
  password: process.env.IRACING_PASSWORD,
  userId: process.env.MY_USER_ID,
};

export const getOrRefreshAuthCode = async () => {
  // Validate env variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: ${missingVars.join(", ")}`,
    });
  }

  // get auth info and check if it expired
  const iracingAuthInfo = await db
    .select()
    .from(iracingAuth)
    .where(eq(iracingAuth.userId, requiredEnvVars.userId!))
    .then((value) => value[0]);

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
      CryptoJS.SHA256(
        requiredEnvVars.password! + requiredEnvVars.email!.toLowerCase(),
      ),
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
        email: process.env.IRACING_EMAIL,
        password: hashedPassword,
      }),
      credentials: "include", // Important for cookies
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `iRacing authentication failed: ${response.status}`,
      });
    }

    const setCookieHeader = response.headers.get("set-cookie");
    const authCode = setCookieHeader?.match(/authtoken_members=([^;]+)/)?.[1];

    if (!authCode) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No valid auth cookie received from iRacing",
      });
    }

    await db
      .insert(iracingAuth)
      .values({
        userId: process.env.MY_USER_ID!,
        authCode,
        expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
      })
      .onDuplicateKeyUpdate({
        set: {
          authCode,
          expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
          updatedAt: new Date(),
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

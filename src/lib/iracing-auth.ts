import CryptoJS from "crypto-js";

import { TRPCError } from "@trpc/server";

import { IRACING_URL } from "@/constants";

export async function getIracingAuthCookie() {
  const hashedPassword = CryptoJS.enc.Base64.stringify(
    CryptoJS.SHA256(
      process.env.IRACING_PASSWORD! + process.env.IRACING_EMAIL!.toLowerCase(),
    ),
  );

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

  // Extract session cookie or token from response
  const setCookieHeader = response.headers.get("set-cookie");
  const authCookie = setCookieHeader?.match(/authtoken_members=([^;]+)/)?.[1];

  console.log("Set-Cookie header:", setCookieHeader);
  console.log("Extracted auth cookie:", authCookie);
  if (!authCookie) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No valid auth cookie received from iRacing",
    });
  }

  return authCookie;
}

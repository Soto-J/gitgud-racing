import { TRPCError } from "@trpc/server";
import CryptoJS from "crypto-js";

export async function getIracingAuthCookie() {
  const hashedPassword = CryptoJS.enc.Base64.stringify(
    CryptoJS.SHA256(
      process.env.IRACING_PASSWORD! + process.env.IRACING_EMAIL!.toLowerCase(),
    ),
  );

  const response = await fetch("https://members-ng.iracing.com/auth", {
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

  const responseData = await response.json();

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `iRacing authentication failed: ${response.status}`,
    });
  }

  // Extract session cookie or token from response
  const setCookieHeader = response.headers.get("set-cookie");
  const authCookie = setCookieHeader?.match(/authtoken_members=([^;]+)/)?.[1];

  if (!authCookie) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No auth cookie found in response",
    });
  }

  return authCookie;
}

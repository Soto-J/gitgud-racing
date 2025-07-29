import { hashIRacingPassword } from "./utils";

export interface IRacingCredentials {
  email: string;
  password: string;
}

export interface IRacingAuthResponse {
  authCookie?: string;
  success: boolean;
  message?: string;
}

export async function authenticateIRacing(
  hashedPassword: string,
  email: string,
): Promise<IRacingAuthResponse> {
  try {
    const response = await fetch("https://members-ng.iracing.com/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: hashedPassword,
      }),
      credentials: "include", // Important for cookies
    });
    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );
    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (!response.ok) {
      return {
        success: false,
        message: "Authentication failed",
      };
    }

    // Extract session cookie or token from response
    const authCookie = response.headers.get("set-cookie");
    return {
      success: true,
      authCookie: authCookie || undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error during authentication",
    };
  }
}

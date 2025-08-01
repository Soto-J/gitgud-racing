export interface IRacingCredentials {
  email: string;
  password: string;
}

export interface IRacingAuthResponse {
  authCookie?: string;
  message?: string;
  iracingEmail?: string;
  success: boolean;
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

    const responseData = await response.json();
    console.log("Response body:", responseData);

    if (!response.ok) {
      return {
        success: false,
        message: "Authentication failed",
      };
    }

    // Extract session cookie or token from response
    const setCookieHeader = response.headers.get("set-cookie");
    const authCookie = setCookieHeader?.match(/authtoken_members=([^;]+)/)?.[1];

    if (!authCookie) {
      return { success: false, message: "No auth cookie found in response" };
    }

    return {
      success: true,
      authCookie: authCookie || undefined,
      iracingEmail: responseData.email,
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error during authentication",
    };
  }
}

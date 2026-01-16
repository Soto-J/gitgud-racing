import { TRPCError } from "@trpc/server";
import { IRACING_URL } from "@/constants";

export type IracingResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: IracingErrorCode; message?: string };

export async function fetchIracingData<T>(
  query: string,
  iracingAccessToken: string,
): Promise<IracingResult<T>> {
  const initialResponse = await fetch(`${IRACING_URL}${query}`, {
    headers: {
      Authorization: `Bearer ${iracingAccessToken}`,
    },
  });

  if (!initialResponse.ok) {
    const text = await initialResponse.text();

    if (initialResponse.status === 401 && text.includes("exp")) {
      return { ok: false, error: "TOKEN_EXPIRED" };
    }

    if (initialResponse.status === 401) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    if (initialResponse.status === 429) {
      return { ok: false, error: "RATE_LIMITED" };
    }

    return { ok: false, error: "UPSTREAM_ERROR", message: text };
  }

  const json = await initialResponse.json();

  if (!json.link) {
    return { ok: true, data: json as T };
  }

  const linkResponse = await fetch(json.link);

  if (!linkResponse.ok) {
    return { ok: false, error: "UPSTREAM_ERROR" };
  }

  return { ok: true, data: (await linkResponse.json()) as T };
}

export type IracingErrorCode =
  | "TOKEN_EXPIRED"
  | "UNAUTHORIZED"
  | "UPSTREAM_ERROR"
  | "RATE_LIMITED";

export function throwIracingError(
  code: IracingErrorCode,
  message?: string,
): never {
  switch (code) {
    case "TOKEN_EXPIRED":
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Your iRacing session expired. Please re-authenticate.",
        cause: { source: "iracing", code },
      });

    case "UNAUTHORIZED":
      throw new TRPCError({
        code: "UNAUTHORIZED",
        cause: { source: "iracing", code },
      });

    case "RATE_LIMITED":
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "iRacing rate limit reached",
        cause: { source: "iracing", code },
      });

    default:
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: message ?? "iRacing API error",
        cause: { source: "iracing", code },
      });
  }
}

export type IracingTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export async function refreshIracingAccessToken(
  refreshToken: string,
): Promise<IracingTokenResponse> {
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

  return res.json();
}

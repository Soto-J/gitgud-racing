import { TRPCError } from "@trpc/server";

export type TokenErrorCode =
  | "ACCESS_DENIED"
  | "INSUFFICIENT_SCOPE"
  | "INVALID_CLIENT"
  | "INVALID_GRANT"
  | "INVALID_REQUEST"
  | "INVALID_SCOPE"
  | "INVALID_TOKEN"
  | "SERVER_ERROR"
  | "TEMPORARILY_UNAVAILABLE"
  | "UNAUTHORIZED_CLIENT"
  | "UNSUPPORTED_GRANT_TYPE"
  | "UNSUPPORTED_RESPONSE_TYPE";

export class RefreshTokenError extends Error {
  constructor(
    message: string,
    public readonly code: TokenErrorCode,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export function mapRefreshErrorToTRPC(err: RefreshTokenError): TRPCError {
  switch (err.code) {
    case "INVALID_GRANT":
    case "INVALID_TOKEN":
    case "ACCESS_DENIED":
      return new TRPCError({
        code: "UNAUTHORIZED",
        message: "iRacing session expired. Please reconnect.",
      });

    case "SERVER_ERROR":
    case "TEMPORARILY_UNAVAILABLE":
      return new TRPCError({
        code: "BAD_GATEWAY",
        message: "iRacing services are currently unavailable",
      });

    default:
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "iRacing authentication misconfigured",
      });
  }
}

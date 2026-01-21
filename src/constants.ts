import env from "./env";

export const IRACING_URL = "https://members-ng.iracing.com";

export const IRACING_REDIRECT_URI = `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/iracing`;

export const IRACING_REFRESH_TOKEN_URL =
  "https://oauth.iracing.com/oauth2/token";

export const IRACING_AUTHORIZATION_URL =
  "https://oauth.iracing.com/oauth2/authorize";

export const IRACING_SCOPES = ["iracing.auth", "iracing.profile"];

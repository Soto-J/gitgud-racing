import { betterAuth } from "better-auth";
import { genericOAuth, admin, createAuthMiddleware } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import env from "@/env";

import { db } from "@/db";
import * as dbSchema from "@/db/schemas";

import { IRACING_URL } from "@/constants";
import { maskIRacingSecret } from "./iracing-oauth-helpers";
import { IracingUserInfoSchema, TokenRespnseSchema } from "./types/schemas";

const isProduction = env.NEXT_PUBLIC_APP_URL.startsWith("https://");

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { ...dbSchema },
  }),
  logger: { level: "debug" },
  trustedOrigins: ["http://localhost:3000", env.NEXT_PUBLIC_APP_URL],

  // tells better-auth to use secure cookies when on HTTPS
  advanced: {
    cookiePrefix: "gitgud",
    useSecureCookies: isProduction,
  },

  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const user = ctx.context.session?.user;

      if (!user) return;

      const [userProfile] = await db
        .select()
        .from(dbSchema.profileTable)
        .where(eq(dbSchema.profileTable.userId, user.id));

      if (!userProfile) {
        await db.insert(dbSchema.profileTable).values({ userId: user.id });
      }
    }),
  },

  plugins: [
    admin({ defaultRole: "user" }),
    genericOAuth({
      config: [
        {
          providerId: "iracing",
          clientId: env.IRACING_CLIENT_ID,
          clientSecret: maskIRacingSecret(
            env.IRACING_AUTH_SECRET,
            env.IRACING_CLIENT_ID,
          ),
          redirectURI: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/iracing`,
          authorizationUrl: "https://oauth.iracing.com/oauth2/authorize",
          tokenUrl: "https://oauth.iracing.com/oauth2/token",
          scopes: ["iracing.auth", "iracing.profile"],
          authorizationUrlParams: { audience: "data-server" },
          pkce: true,

          async getToken({ code, redirectURI, codeVerifier }) {
            if (!codeVerifier) {
              throw new Error("Code verifier missing");
            }

            const response = await fetch(
              "https://oauth.iracing.com/oauth2/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  grant_type: "authorization_code",
                  code,
                  redirect_uri: redirectURI,
                  client_id: env.IRACING_CLIENT_ID,
                  client_secret: maskIRacingSecret(
                    env.IRACING_AUTH_SECRET,
                    env.IRACING_CLIENT_ID,
                  ),
                  code_verifier: codeVerifier,
                }),
              },
            );

            if (!response.ok) {
              const text = await response.text();
              throw new Error(`Failed to exchange code for token: ${text}`);
            }

            const payload = await response.json();

            console.log(payload);
            const data = TokenRespnseSchema.parse(payload);

            return {
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              accessTokenExpiresAt: new Date(
                Date.now() + data.expires_in * 1000,
              ),
              refreshTokenExpiresAt: new Date(
                Date.now() + data.refresh_token_expires_in * 1000,
              ),
              scope: data.scope,
            };
          },

          async getUserInfo(tokens) {
            const initialResponse = await fetch(
              `${IRACING_URL}/data/member/info`,
              {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
              },
            );

            if (!initialResponse.ok) {
              throw new Error("Failed to get initial response");
            }

            const { link } = await initialResponse.json();
            const linkResponse = await fetch(link);

            if (!linkResponse.ok) {
              throw new Error("Failed to get member info link");
            }

            const data = await linkResponse.json();
            const memberInfo = IracingUserInfoSchema.parse(data);

            // iRacing doesn't provide email, so we create a synthetic one
            const syntheticEmail = `iracing-${memberInfo.cust_id}@gitgud-racing.app`;

            return {
              id: String(memberInfo.cust_id),
              name: memberInfo.display_name,
              email: syntheticEmail,
              emailVerified: false,
            };
          },
        },
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

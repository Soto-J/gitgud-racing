import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAuthMiddleware } from "better-auth/plugins";

import { eq } from "drizzle-orm";

import env from "@/env";

import { db } from "@/db";
import * as dbSchema from "@/db/schemas";

import { maskIRacingSecret } from "../iracing-oauth-helpers";
import { GetUserInfoSchema } from "./schemas";
import { IRACING_URL } from "@/constants";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { ...dbSchema },
  }),
  logger: { level: "debug" },

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
    admin({
      defaultRole: "user",
    }),
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
          pkce: true,
          authorizationUrlParams: { audience: "data-server" },

          async getUserInfo(tokens) {
            console.log("TOKENS: ", tokens);
            console.log(
              "MASK: ",
              maskIRacingSecret(env.IRACING_AUTH_SECRET, env.IRACING_CLIENT_ID),
            );

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
            const memberInfo = GetUserInfoSchema.parse(data);

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

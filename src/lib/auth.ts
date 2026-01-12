import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAuthMiddleware } from "better-auth/plugins";
import { genericOAuth } from "better-auth/plugins";

import { eq } from "drizzle-orm";

import env from "@/env";

import { db } from "@/db";
import * as dbSchema from "@/db/schemas";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { ...dbSchema },
  }),

  emailAndPassword: {
    enabled: true,
  },
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
          clientSecret: env.IRACING_AUTH_SECRET,

          redirectURI:
            "https://gitgud-racing.vercel.app/api/auth/callback/iracing",

          authorizationUrl: "https://oauth.iracing.com/oauth2/authorize",
          tokenUrl: "https://oauth.iracing.com/oauth2/token",

          scopes: ["iracing.auth", "iracing.profile"],
          pkce: true,

          // mapProfileToUser(profile) {

          // },
        },
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

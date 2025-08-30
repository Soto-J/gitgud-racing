import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAuthMiddleware } from "better-auth/plugins";

import { db } from "@/db";
import * as dbSchema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      ...dbSchema,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const user = ctx.context.session?.user;

      if (!user) return;

      await db
        .insert(dbSchema.profileTable)
        .values({ userId: user.id })
        .onDuplicateKeyUpdate({
          set: { userId: user.id },
        });

      await db
        .insert(dbSchema.licenseTable)
        .values({ userId: user.id })
        .onDuplicateKeyUpdate({
          set: { userId: user.id },
        });
    }),
  },

  plugins: [
    admin({
      defaultRole: "member",
    }),
  ],
});

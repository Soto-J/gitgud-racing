import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAuthMiddleware } from "better-auth/plugins";

import { eq } from "drizzle-orm";

import env from "@/env";

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
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const user = ctx.context.session?.user;

      if (!user) return;

      const userProfile = await db
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
  ],
});

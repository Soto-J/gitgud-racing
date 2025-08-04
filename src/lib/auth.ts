import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAuthMiddleware } from "better-auth/plugins";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as dbSchema from "@/db/schema";

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
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const user = ctx.context.session?.user;

      if (!user) return;

      const now = new Date();
      const userCreatedAt = new Date(user.createdAt);

      // Check if user was created within the last 5 seconds
      const isNewUser = now.getTime() - userCreatedAt.getTime() < 5000;

      if (isNewUser) {
        try {
          const [userProfile] = await db
            .select()
            .from(dbSchema.profile)
            .where(eq(dbSchema.profile.id, user.id));

          if (!userProfile) {
            await db.insert(dbSchema.profile).values({ userId: user.id });
          }
        } catch (error) {
          console.error(error)
        }
      }
    }),
  },

  plugins: [admin({ defaultRole: "member" })],
});

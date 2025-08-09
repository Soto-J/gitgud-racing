import { cache } from "react";
import { headers } from "next/headers";

import { initTRPC, TRPCError } from "@trpc/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { iracingAuth, license, profile } from "@/db/schema";

import { auth } from "@/lib/auth";
import { getIracingAuthCookie } from "@/lib/iracing-auth";

import { COOKIE_EXPIRES_IN_MS, IRACING_URL } from "@/constants";

import {
  IRacingFetchResult,
  IRacingLicense,
  TransformLicenseData,
} from "@/modules/iracing/types";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { role } = ctx.auth.user;

  if (role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const iracingAuthData = await db
      .select()
      .from(iracingAuth)
      .where(eq(iracingAuth.userId, process.env.MY_USER_ID!))
      .then((value) => value[0]);

    const isValid =
      iracingAuthData?.expiresAt && iracingAuthData.expiresAt > new Date();

    if (isValid) {
      console.log("Using cashed iRacing auth....");
      return next({
        ctx: {
          ...ctx,
          iracingAuthData,
        },
      });
    }

    console.log("Refreshing iRacing auth...");
    const authCookie = await getIracingAuthCookie();

    await db
      .insert(iracingAuth)
      .values({
        userId: process.env.MY_USER_ID!,
        authCookie: authCookie,
        expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
      })
      .onDuplicateKeyUpdate({
        set: {
          authCookie: authCookie,
          expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
          updatedAt: new Date(),
        },
      });

    const refreshedAuth = await db
      .select()
      .from(iracingAuth)
      .where(eq(iracingAuth.userId, process.env.MY_USER_ID!))
      .then((value) => value[0]);

    return next({
      ctx: {
        ...ctx,
        iracingAuthData: refreshedAuth,
      },
    });
  },
);

export const syncIracingProfileProcedure = iracingProcedure.use(
  async ({ ctx, next }) => {
    const user = await db
      .select()
      .from(profile)
      .leftJoin(license, eq(license.userId, ctx.auth.user.id))
      .where(eq(profile.userId, ctx.auth.user.id))
      .then((value) => value[0]);

    // If user hasn't input an iracingId/custId return
    if (!user.profile?.iracingId) {
      return next({ ctx });
    }

    // Check if we need to sync (e.g., data is stale)
    const lastSync = user?.license?.lastIracingSync;
    const shouldSync =
      !lastSync ||
      new Date().getTime() - lastSync.getTime() > 24 * 60 * 60 * 1000; // 24 hours

    if (!shouldSync && lastSync) {
      console.log("Using cached iRacing userData Data");
      return next({ ctx });
    }

    // Otherwise we either update or create licenses for user
    try {
      // Fetch from iRacing API
      const response = await fetch(
        `${IRACING_URL}/data/member/get?cust_ids=${user.profile.iracingId}&include_licenses=true`,
        {
          headers: {
            Cookie: `authtoken_members=${ctx.iracingAuthData.authCookie}`,
          },
        },
      );

      if (!response.ok) {
        return next({ ctx });
      }

      const { link } = await response.json();
      const dataResponse = await fetch(link);
      const iracingData: IRacingFetchResult = await dataResponse.json();
      console.log({ iracingData });

      const licenses = iracingData.members[0].licenses;

      if (!licenses) {
        console.error("No licenses found on iRacing api");
        return next({ ctx });
      }

      const transformedData = transformLicenseData(licenses);

      console.log(transformedData);
      await db
        .insert(license)
        .values({
          ...transformedData,
          userId: ctx.auth.user.id,
          lastIracingSync: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            ...transformedData,
            lastIracingSync: new Date(),
          },
        });

      console.log("iRacing profile data synced");
      return next({ ctx });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to sync iRacing data:", error.message);
      }

      return next({ ctx });
    }
  },
);

const transformLicenseData = (
  licenses: IRacingLicense[],
): TransformLicenseData => {
  const categoryMap = {
    oval: "oval",
    sports_car: "sportsCar",
    formula_car: "formulaCar",
    dirt_oval: "dirtOval",
    dirt_road: "dirtRoad",
  } as const;

  // Ensure only return valid license classes
  const normalizeClass = (cls: string): "A" | "B" | "C" | "D" | "R" => {
    if (cls === "Rookie") return "R";

    if (["A", "B", "C", "D", "R"].includes(cls)) {
      return cls as "A" | "B" | "C" | "D" | "R";
    }

    return "R";
  };

  return licenses.reduce((acc, license) => {
    const category = categoryMap[license.category as keyof typeof categoryMap];

    if (!category) return acc;

    const licenseClass = license.group_name.replace("Class ", "").trim();
    const normalizedClass = licenseClass === "Rookie" ? "R" : licenseClass;

    return {
      ...acc,
      [`${category}IRating`]: license.irating,
      [`${category}SafetyRating`]: license.safety_rating.toFixed(2),
      [`${category}LicenseClass`]: normalizeClass(normalizedClass),
    };
  }, {} as TransformLicenseData);
};

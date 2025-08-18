import { cache } from "react";
import { headers } from "next/headers";

import { initTRPC, TRPCError } from "@trpc/server";

import { eq, gt } from "drizzle-orm";
import * as helper from "@/modules/iracing/server/helper";
import { db } from "@/db";
import { licenseTable, profileTable, seriesTable } from "@/db/schema";

import { auth } from "@/lib/auth";

import { IRACING_URL } from "@/constants";

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

export const cronJobProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const iracingAuthCode = await helper.getOrRefreshAuthCode();
  return next({
    ctx: {
      ...ctx,
      iracingAuthCode: iracingAuthCode,
    },
  });
});

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.auth.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const iracingAuthCode = await helper.getOrRefreshAuthCode();

    await helper.cacheSeries({
      authCode: iracingAuthCode,
    });

    return next({
      ctx: {
        ...ctx,
        iracingAuthCode: iracingAuthCode,
      },
    });
  },
);

export const syncIracingProfileProcedure = iracingProcedure.use(
  async ({ ctx, next }) => {
    const user = await db
      .select()
      .from(profileTable)
      .leftJoin(licenseTable, eq(licenseTable.userId, ctx.auth.user.id))
      .where(eq(profileTable.userId, ctx.auth.user.id))
      .then((value) => value[0]);

    // User hasn't input an iracingId/custId return
    if (!user.profile?.iracingId) {
      return next({ ctx });
    }

    // Check if we need to sync (e.g., data is stale)
    const lastSync = user?.license?.updatedAt;
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
            Cookie: `authtoken_members=${ctx.iracingAuthCode}`,
          },
        },
      );

      if (!response.ok) {
        return next({ ctx });
      }

      const { link } = await response.json();

      const dataResponse = await fetch(link);

      const iracingData: IRacingFetchResult = await dataResponse.json();

      const licenses = iracingData.members[0]?.licenses;

      if (!licenses) {
        console.error("No licenses found on iRacing api");
        return next({ ctx });
      }

      const transformedData = transformLicenseData(licenses);

      await db
        .insert(licenseTable)
        .values({
          ...transformedData,
          userId: ctx.auth.user.id,
        })
        .onDuplicateKeyUpdate({
          set: {
            ...transformedData,
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

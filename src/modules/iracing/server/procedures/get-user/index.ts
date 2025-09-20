import { DateTime } from "luxon";
import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { licenseTable } from "@/db/schemas";

import {
  UserInputSchema,
  UserResponseSchema,
} from "@/modules/iracing/server/procedures/get-user/schema";

import { fetchData } from "@/modules/iracing/server/api";

import {
  buildUserProfile,
  mapLicenseTypesToDb,
  getUserWithLicenses,
} from "./utilities";

/**
 * Fetches comprehensive user data including profile and license information
 *
 * This procedure implements a smart caching strategy that:
 * 1. First checks the database for existing user data
 * 2. If license data is fresh (< 24 hours), returns cached data
 * 3. If data is stale or missing, syncs fresh data from iRacing API
 * 4. Returns structured user profile with organized license disciplines
 *
 * The procedure handles various edge cases:
 * - User not found in database
 * - Missing iRacing profile connection
 * - API sync failures (gracefully falls back to cached data)
 * - Missing or incomplete license data
 *
 * @param input - Contains userId to fetch data for
 * @param ctx - tRPC context with iRacing authentication code
 *
 * @returns Structured user profile with license disciplines array
 *
 * @throws TRPCError with "NOT_FOUND" code if user doesn't exist
 *
 * @example
 * ```typescript
 * const user = await trpc.iracing.getUser.query({ userId: "user_123" });
 * console.log(user.licenses.disciplines[0]); // { category: "Oval", iRating: 2500, ... }
 * ```
 */
export const getUserProcedure = iracingProcedure
  .input(UserInputSchema)
  .query(async ({ ctx, input }) => {
    // Fetch initial user data from database
    const userData = await getUserWithLicenses(input.userId);

    // Validate user exists in database
    if (!userData?.user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // If user has no iRacing profile connection, return basic profile
    if (!userData.profile?.iracingId) {
      return buildUserProfile(userData);
    }

    // Check if license data is fresh (updated within last 24 hours)
    // This prevents unnecessary API calls and reduces load on iRacing servers
    const hasFreshData = userData?.licenses
      ? DateTime.fromJSDate(userData.licenses.updatedAt).diffNow().hours > -24
      : false;

    if (hasFreshData) {
      return buildUserProfile(userData);
    }

    // License data is stale - fetch fresh data from iRacing API
    try {
      // Fetch latest license data from iRacing API
      const response = await fetchData({
        query: `/data/member/get?cust_ids=${userData.profile.iracingId}&include_licenses=true`,
        authCode: ctx.iracingAuthCode,
      });

      const data = UserResponseSchema.parse(response);
      const apiLicenses = data.members[0].licenses;
      const transformedData = mapLicenseTypesToDb(apiLicenses);

      // Update database with fresh license data
      await db
        .insert(licenseTable)
        .values({
          ...transformedData,
          userId: input.userId,
        })
        .onDuplicateKeyUpdate({
          set: { ...transformedData },
        });

      // Fetch updated user data and return structured profile
      const updatedUserData = await getUserWithLicenses(input.userId);
      return buildUserProfile(updatedUserData);
    } catch (error) {
      // If API sync fails, gracefully fall back to cached data
      // This ensures the user still gets their profile even if iRacing API is down
      console.error("Failed to sync license data:", error);
      return buildUserProfile(userData);
    }
  });

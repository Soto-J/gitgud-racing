import { DateTime } from "luxon";
import { getTableColumns, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { user, profileTable, licenseTable } from "@/db/schema";

import { fetchData } from "../api";

import { IRacingGetUserInputSchema } from "@/modules/iracing/schema";
import {
  IRacingMemberData,
  IRacingTransformLicensesInput,
  LicenseDiscipline,
} from "@/modules/iracing/types";
import { mapIRacingLicensesToDb } from "../transforms";
import { syncUserLicenseData } from "./procedure-helpers";

/**
 * Fetches user data with license information, syncing from iRacing if needed
 */
export const getUserProcedure = iracingProcedure
  .input(IRacingGetUserInputSchema)
  .query(async ({ ctx, input }) => {
    if (!input?.userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "userId is required",
      });
    }

    const userData = await db
      .select({
        user: { ...getTableColumns(user) },
        profile: { ...getTableColumns(profileTable) },
        licenses: { ...getTableColumns(licenseTable) },
      })
      .from(user)
      .leftJoin(profileTable, eq(profileTable.userId, user.id))
      .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
      .where(eq(user.id, input.userId))
      .then((rows) => rows[0]);

    if (!userData?.user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (!userData.profile?.iracingId) {
      return buildUserProfile(userData);
    }

    const hasFreshData = userData?.licenses
      ? DateTime.fromJSDate(userData.licenses.updatedAt).diffNow().hours < 24
      : false;

    if (hasFreshData) {
      return buildUserProfile(userData);
    }

    // Sync fresh data from iRacing
    try {
      await syncUserLicenseData(
        userData.profile?.iracingId,
        input.userId,
        ctx.iracingAuthCode,
      );

      const iRacingUserData = (await fetchData({
        query: `/data/member/get?cust_ids=${userData.profile.iracingId}&include_licenses=true`,
        authCode: ctx.iracingAuthCode,
      })) as IRacingMemberData;

      const apiLicenses = iRacingUserData.members[0].licenses;
      const transformedData = mapIRacingLicensesToDb(apiLicenses);

      await db
        .insert(licenseTable)
        .values({
          ...transformedData,
          userId: input.userId,
        })
        .onDuplicateKeyUpdate({
          set: { ...transformedData },
        });

      const updatedUserData = await db
        .select({
          user: { ...getTableColumns(user) },
          profile: { ...getTableColumns(profileTable) },
          licenses: { ...getTableColumns(licenseTable) },
        })
        .from(user)
        .leftJoin(profileTable, eq(profileTable.userId, user.id))
        .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
        .where(eq(user.id, input.userId))
        .then((rows) => rows[0]);

      return buildUserProfile(updatedUserData);
    } catch (error) {
      console.error("Failed to sync license data:", error);
      return buildUserProfile(userData);
    }
  });

/**
 * Builds a complete user profile from database components
 *
 * This function takes the flat database result (user, profile, and licenses)
 * and assembles it into a structured user profile object with organized
 * license disciplines. It handles cases where license data may be missing
 * or incomplete.
 *
 * @param member - Database result including user, profile, and license information
 *
 * @returns Complete user profile with structured license disciplines
 *
 * @example
 * ```typescript
 * const dbResult = {
 *   user: { id: "123", name: "John" },
 *   profile: { iracingId: "958942" },
 *   licenses: {
 *     ovalIRating: 2500,
 *     ovalSafetyRating: "3.45",
 *     ovalLicenseClass: "A",
 *     // ... other license data
 *   }
 * };
 *
 * const userProfile = buildUserProfile(dbResult);
 * console.log(userProfile.licenses.disciplines[0]);
 * // { category: "Oval", iRating: 2500, safetyRating: "3.45", licenseClass: "A" }
 * ```
 */
export const buildUserProfile = (member: IRacingTransformLicensesInput) => {
  if (!member?.licenses) {
    return {
      ...member,
      licenses: {
        id: null,
        createdAt: null,
        updatedAt: null,
        disciplines: [],
      },
    };
  }

  const licenseData = member.licenses;

  // Create an array of license objects
  const disciplinesArray: LicenseDiscipline[] = [
    {
      category: "Oval",
      iRating: licenseData.ovalIRating,
      safetyRating: licenseData.ovalSafetyRating,
      licenseClass: licenseData.ovalLicenseClass,
    },
    {
      category: "Sports",
      iRating: licenseData.sportsCarIRating,
      safetyRating: licenseData.sportsCarSafetyRating,
      licenseClass: licenseData.sportsCarLicenseClass,
    },
    {
      category: "Formula",
      iRating: licenseData.formulaCarIRating,
      safetyRating: licenseData.formulaCarSafetyRating,
      licenseClass: licenseData.formulaCarLicenseClass,
    },
    {
      category: "Dirt Oval",
      iRating: licenseData.dirtOvalIRating,
      safetyRating: licenseData.dirtOvalSafetyRating,
      licenseClass: licenseData.dirtOvalLicenseClass,
    },
    {
      category: "Dirt Road",
      iRating: licenseData.dirtRoadIRating,
      safetyRating: licenseData.dirtRoadSafetyRating,
      licenseClass: licenseData.dirtRoadLicenseClass,
    },
  ];

  // Excluding the old licenses field
  const { licenses, ...userAndProfile } = member;

  return {
    ...userAndProfile,
    licenses: {
      id: licenses.id,
      createdAt: licenses.createdAt,
      updatedAt: licenses.updatedAt,
      disciplines: disciplinesArray,
    },
  };
};

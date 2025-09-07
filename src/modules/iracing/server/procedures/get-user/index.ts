import { DateTime } from "luxon";
import { getTableColumns, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { user, profileTable, licenseTable } from "@/db/schema";

import {
  GetUserInput,
  GetUserResponse,
} from "@/modules/iracing/server/procedures/get-user/schema";

import { fetchData } from "@/modules/iracing/server/api";

import {
  buildUserProfile,
  mapLicenseTypesToDb,
  syncUserLicenseData,
} from "./helper";

/**
 * Fetches user data with license information, syncing from iRacing if needed
 */
export const getUserProcedure = iracingProcedure
  .input(GetUserInput)
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

      const res = await fetchData({
        query: `/data/member/get?cust_ids=${userData.profile.iracingId}&include_licenses=true`,
        authCode: ctx.iracingAuthCode,
      });

      const data = GetUserResponse.parse(res);

      const apiLicenses = data.members[0].licenses;
      const transformedData = mapLicenseTypesToDb(apiLicenses);

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

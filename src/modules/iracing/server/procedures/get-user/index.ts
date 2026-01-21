import { DateTime } from "luxon";
import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { db } from "@/db";
import { licenseTable, user } from "@/db/schemas";

import {
  UserInputSchema,
  UserResponseSchema,
} from "@/modules/iracing/server/procedures/get-user/schema";

import { fetchIracingData } from "@/modules/iracing/server/api";

import {
  buildUserProfile,
  mapLicenseTypesToDb,
  getUserWithLicenses,
} from "./utilities";

export const getUserProcedure = iracingProcedure
  .input(UserInputSchema)
  .query(async ({ ctx, input }) => {
    const userData = await getUserWithLicenses(input.userId);

    if (!userData?.profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const response = await fetchIracingData(
      `/data/member/get?cust_ids=${Number(userData.account!.accountId)}&include_licenses=true`,
      ctx.iracingAccessToken,
    );

    if (!response.ok) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    console.log({ response });

    const data = UserResponseSchema.parse(response.data);
    
    return data;
    // Check if license data is fresh (updated within last 24 hours)
    // This prevents unnecessary API calls and reduces load on iRacing servers
    // const hasFreshData = userData?.licenses
    //   ? DateTime.now().diff(
    //       DateTime.fromJSDate(userData.licenses.updatedAt),
    //       "hours",
    //     ).hours < 24
    //   : false;

    // if (hasFreshData) {
    //   return buildUserProfile(userData);
    // }

    // License data is stale - fetch fresh data from iRacing API

    // Fetch latest license data from iRacing API
    // const response = await fetchIracingData(
    //   `/data/member/get?cust_ids=${userData.profile.iracingId}&include_licenses=true`,
    //   ctx.iracingAccessToken,
    // );

    // const data = UserResponseSchema.parse(response);
    // const apiLicenses = data.members[0].licenses;
    // const transformedData = mapLicenseTypesToDb(apiLicenses);

    // Update database with fresh license data
    // await db
    //   .insert(licenseTable)
    //   .values({
    //     ...transformedData,
    //     userId: input.userId,
    //   })
    //   .onDuplicateKeyUpdate({
    //     set: { ...transformedData },
    //   });

    // Fetch updated user data and return structured profile
    // const updatedUserData = await getUserWithLicenses(input.userId);
    // return buildUserProfile(updatedUserData);

    // If API sync fails, gracefully fall back to cached data
    // This ensures the user still gets their profile even if iRacing API is down
    // console.error("Failed to sync license data:", error);
    // return buildUserProfile(userData);
  });

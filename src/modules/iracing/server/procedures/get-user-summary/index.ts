import { eq } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable } from "@/db/schema";

import { fetchData } from "@/modules/iracing/server/api";

import { GetUserSummaryResponse } from "@/modules/iracing/server/procedures/get-user-summary/schema";

/**
 * Fetches user summary statistics from iRacing
 */
export const getUserSummaryProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    const userProfile = await db
      .select({ custId: profileTable.iracingId })
      .from(profileTable)
      .where(eq(profileTable.userId, ctx.auth.user.id))
      .then((row) => row[0]);

    if (!userProfile?.custId) {
      return null;
    }

    const res = await fetchData({
      query: `/data/stats/member_summary?cust_id=${userProfile.custId}`,
      authCode: ctx.iracingAuthCode,
    });

    const userSummary = GetUserSummaryResponse.parse(res);

    return userSummary || null;
  },
);

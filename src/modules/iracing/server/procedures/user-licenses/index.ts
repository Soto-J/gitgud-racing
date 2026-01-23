import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { account as accountTable } from "@/db/schemas";
import { db } from "@/db";
import {
  GetLicensesInputSchema,
  UserResponseSchema,
} from "@/modules/iracing/server/procedures/user-licenses/types/schema";

import { fetchIracingData } from "@/modules/iracing/server/api";
import { getLicenseClassFromLevel } from "./utilities";

export const userLicensesProcedure = iracingProcedure
  .input(GetLicensesInputSchema)
  .query(async ({ ctx, input }) => {
    const [account] = await db
      .select({ custId: accountTable.accountId })
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, input.userId),
          eq(accountTable.providerId, "iracing"),
        ),
      );

    const response = await fetchIracingData(
      `/data/member/get?cust_ids=${Number(account.custId)}&include_licenses=true`,
      ctx.iracingAccessToken,
    );

    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to get licenses from api",
      });
    }

    console.log({ response });

    const data = UserResponseSchema.parse(response.data);

    return {
      lastLogin: data.members[0].last_login,
      memberSince: data.members[0].member_since,
      licenses: data.members[0].licenses.map((license) => ({
        categoryId: license.category_id,
        category: license.category,
        categoryName: license.category_name,
        licenseLevel: license.license_level,
        licenseClass: getLicenseClassFromLevel(license.license_level),
        safetyRating: license.safety_rating,
        cpi: license.cpi,
        irating: license.irating,
        ttRating: license.tt_rating,
        mprNumRaces: license.mpr_num_races,
        mprNumTts: license.mpr_num_tts,
        color: `#${license.color}`,
        groupName: license.group_name,
        groupId: license.group_id,
        proPromotable: license.pro_promotable,
        seq: license.seq,
      })),
    };
  });

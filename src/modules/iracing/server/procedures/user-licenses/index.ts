import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { account as accountTable } from "@/db/schemas";
import { db } from "@/db";
import {
  GetLicensesInputSchema,
  LicensesResponseSchema,
} from "@/modules/iracing/server/procedures/user-licenses/types/schema";

import { fetchIracingData } from "@/modules/iracing/server/api";
import { LicensesResponse } from "./types";

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
        code: "BAD_GATEWAY",
        message: "iRacing API error while fetching licenses",
      });
    }

    const data = LicensesResponseSchema.parse(response.data);

    return transformData(data);
  });

function transformData(data: LicensesResponse) {
  const member = data.members[0];

  if (!member) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "iRacing response missing member data",
    });
  }

  const logoMap: Record<string, string> = {
    Oval: "/category/license-icon-oval-gradient.svg",
    "Sports Car": "/category/license-icon-sport-gradient.svg",
    "Formula Car": "/category/license-icon-formula-gradient.svg",
    "Dirt Oval": "/category/license-icon-dirtoval-gradient.svg",
    "Dirt Road": "/category/license-icon-dirtroad-gradient.svg",
  };

  return {
    lastLogin: member.last_login,
    memberSince: member.member_since,
    licenses: member.licenses.map((license) => ({
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
      categoryImageSrc:
        logoMap[license.category_name] ??
        "/category/license-icon-sport-gradient.svg",
    })),
  };
}

function getLicenseClassFromLevel(licenseLevel: number): string {
  if (licenseLevel >= 21) return "A+";
  if (licenseLevel >= 17) return "A";
  if (licenseLevel >= 13) return "B";
  if (licenseLevel >= 9) return "C";
  if (licenseLevel >= 5) return "D";
  return "R";
}

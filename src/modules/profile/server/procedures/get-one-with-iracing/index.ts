import { getTableColumns, eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { db } from "@/db";
import {
  account as accountTable,
  profileTable,
  user as userTable,
} from "@/db/schemas";

import { fetchMemberGet } from "@/lib/iracing/member/get";
import { fetchMemberChartData } from "@/lib/iracing/member/chart_data";

import { ProfileGetOneInputSchema } from "@/modules/profile/server/procedures/get-one/types/schema";
import { CATEGORY_NAME_MAP, CHART_TYPE_MAP } from "@/lib/iracing/constants";

const LOGO_MAP: Record<string, string> = {
  Oval: "/category/license-icon-oval-gradient.svg",
  "Sports Car": "/category/license-icon-sport-gradient.svg",
  "Formula Car": "/category/license-icon-formula-gradient.svg",
  "Dirt Oval": "/category/license-icon-dirtoval-gradient.svg",
  "Dirt Road": "/category/license-icon-dirtroad-gradient.svg",
};

function getLicenseClassFromLevel(licenseLevel: number) {
  if (licenseLevel >= 21) return "A+";
  if (licenseLevel >= 17) return "A";
  if (licenseLevel >= 13) return "B";
  if (licenseLevel >= 9) return "C";
  if (licenseLevel >= 5) return "D";
  return "R";
}

export const getProfileWithIracingProcedure = iracingProcedure
  .input(ProfileGetOneInputSchema)
  .query(async ({ ctx, input }) => {
    const [profile] = await db
      .select({
        ...getTableColumns(profileTable),
        userName: userTable.name,
        email: userTable.email,
        custId: accountTable.accountId,
      })
      .from(profileTable)
      .innerJoin(userTable, eq(userTable.id, profileTable.userId))
      .innerJoin(
        accountTable,
        and(
          eq(accountTable.userId, profileTable.userId),
          eq(accountTable.providerId, "iracing"),
        ),
      )
      .where(eq(profileTable.userId, input.userId));

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Profile not found for user: ${input.userId}`,
      });
    }

    if (!profile.custId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No iRacing account linked to this profile",
      });
    }

    const [memberData, chartDataRaw] = await Promise.all([
      fetchMemberGet(profile.custId, ctx.iracingAccessToken),
      fetchMemberChartData(profile.custId, ctx.iracingAccessToken),
    ]);

    const member = memberData.members[0];

    if (!member) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: "iRacing response missing member data",
      });
    }

    return {
      profile,
      iracing: {
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
            LOGO_MAP[license.category_name] ??
            "/category/license-icon-sport-gradient.svg",
        })),
      },
      chartData: chartDataRaw.map((chart) => ({
        data: chart.data,
        categoryName: CATEGORY_NAME_MAP[chart.category_id],
        chartType: CHART_TYPE_MAP[chart.chart_type],
      })),
    };
  });

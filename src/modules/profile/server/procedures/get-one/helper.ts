import { eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { licenseTable, profileTable, user } from "@/db/schemas";

export type ProfileWithUserAndLicenses = {
  id: string | null;
  userId: string | null;
  iracingId: string | null;
  discord: string | null;
  team: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  memberName: string;
  // License fields (nullable if no licenses exist)
  ovalIRating?: number | null;
  ovalSafetyRating?: string | null;
  ovalLicenseClass?: string | null;
  sportsCarIRating?: number | null;
  sportsCarSafetyRating?: string | null;
  sportsCarLicenseClass?: string | null;
  formulaCarIRating?: number | null;
  formulaCarSafetyRating?: string | null;
  formulaCarLicenseClass?: string | null;
  dirtOvalIRating?: number | null;
  dirtOvalSafetyRating?: string | null;
  dirtOvalLicenseClass?: string | null;
  dirtRoadIRating?: number | null;
  dirtRoadSafetyRating?: string | null;
  dirtRoadLicenseClass?: string | null;
};

/**
 * Fetches a complete profile with user information and license data
 */
export async function getCompleteProfile(
  userId: string,
): Promise<ProfileWithUserAndLicenses> {
  const profileWithUser = await db
    .select({
      ...getTableColumns(profileTable),
      ...getTableColumns(licenseTable),
      memberName: user.name,
    })
    .from(profileTable)
    .innerJoin(user, eq(user.id, profileTable.userId))
    .leftJoin(licenseTable, eq(licenseTable.userId, profileTable.userId))
    .where(eq(profileTable.userId, userId))
    .then((row) => row[0]);

  if (!profileWithUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Profile not found for user: ${userId}`,
    });
  }

  return profileWithUser;
}
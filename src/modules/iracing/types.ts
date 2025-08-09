import { InferSelectModel } from "drizzle-orm";

import { inferRouterOutputs } from "@trpc/server";
import { license } from "@/db/schema";

import { AppRouter } from "@/trpc/routers/_app";

export type UserGetOne = inferRouterOutputs<AppRouter>["iracing"]["getUser"];

// Init
export type IRacingLicense = {
  category: string;
  category_id: number;
  category_name: string;
  color: string;
  cpi: number;
  group_id: number;
  group_name: string;
  irating: number;
  license_level: number;
  mpr_num_races: number;
  mpr_num_tts: number;
  pro_promotable: boolean;
  safety_rating: number;
  seq: number;
  tt_rating: number;
};
export type IRacingFetchResult = {
  cust_ids: number[];
  members: {
    ai: boolean;
    cust_id: number;
    display_name: string;
    flair_id: number;
    flair_name: string;
    flair_shortname: string;
    helmet: {
      pattern: number;
      color1: string;
      color2: string;
      color3: string;
      face_type: number;
      helmet_type: number;
    };
    last_login: string;
    licenses: IRacingLicense[];
  }[];
  member_since: string;
};

export type LicenseClass = "A" | "B" | "C" | "D" | "R";
export type TransformLicenseData = {
  ovalIRating: number;
  ovalSafetyRating: string;
  ovalLicenseClass: LicenseClass;

  sportsCarIRating: number;
  sportsCarSafetyRating: string;
  sportsCarLicenseClass: LicenseClass;

  formulaCarIRating: number;
  formulaCarSafetyRating: string;
  formulaCarLicenseClass: LicenseClass;

  dirtOvalIRating: number;
  dirtOvalSafetyRating: string;
  dirtOvalLicenseClass: LicenseClass;

  dirtRoadIRating: number;
  dirtRoadSafetyRating: string;
  dirtRoadLicenseClass: LicenseClass;
};

// -------------------------------
type user = {
  id: string;
  name: string;
  email: string;
};
type Profile = {
  id: string;
  iracingId: string | null;
  discord: string | null;
  team: string | null;
  bio: string | null;
  isActive: boolean;
};

// Input
export type TransformLicensesInput = {
  user: user;
  profile: Profile;
  licenses: InferSelectModel<typeof license> | null;
};

// Output
export type LicenseDiscipline = {
  category: "Oval" | "Sports" | "Formula" | "Dirt Oval" | "Dirt Road";
  iRating: number | null;
  safetyRating: string | null;
  licenseClass: string;
};

export type TransformLicensesOutput = {
  user: user;
  profile: Profile;
  licenses: {
    id: string;

    disciplines: LicenseDiscipline[];
  } | null;
};

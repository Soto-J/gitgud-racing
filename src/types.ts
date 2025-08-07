import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type LicenseGetUser =
  inferRouterOutputs<AppRouter>["iracing"]["getUser"];

export type LicenseData = {
  [K in `${string}${"IRating" | "SafetyRating" | "LicenseClass"}`]:
    | string
    | number
    | null;
};

export type IracingLicense = {
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
    licenses: IracingLicense[];
  }[];
  member_since: string;
};

type LicenseClass = "A" | "B" | "C" | "D" | "R";
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

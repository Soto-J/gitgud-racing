import { InferSelectModel } from "drizzle-orm";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";
import {
  licenseTable,
  profileTable,
  userChartDataTable,
  user,
} from "@/db/schema";

// =============================================================================
// TRPC ROUTER OUTPUT TYPES
// =============================================================================

export type IRacingWeeklySeriesResults =
  inferRouterOutputs<AppRouter>["iracing"]["weeklySeriesResults"];
export type IRacingChartData =
  inferRouterOutputs<AppRouter>["iracing"]["userChartData"];
export type IRacingUserSummary =
  inferRouterOutputs<AppRouter>["iracing"]["getUserSummary"];

// =============================================================================
// DATABASE SCHEMA TYPES
// =============================================================================

export type IRacingChartDataRecord = typeof userChartDataTable.$inferSelect;

export type IRacingTransformLicensesInput = {
  user: InferSelectModel<typeof user>;
  profile: InferSelectModel<typeof profileTable> | null;
  licenses: InferSelectModel<typeof licenseTable> | null;
};

// =============================================================================
// IRACING API RESPONSE TYPES
// =============================================================================

export type IRacingLicense = {
  category_id: number;
  category: string;
  category_name: string;
  license_level: number;
  safety_rating: number;
  cpi: number;
  irating: number;
  tt_rating: number;
  mpr_num_races: number;
  group_name: string;
  color: string;
  group_id: number;
  pro_promotable: boolean;
  seq: number;
  mpr_num_tts: number;
};

export type IRacingMemberData = {
  success: boolean;
  cust_ids: number[];
  members: {
    cust_id: number;
    display_name: string;
    helmet: {
      pattern: number;
      color1: string;
      color2: string;
      color3: string;
      face_type: number;
      helmet_type: number;
    };
    last_login: string;
    member_since: string;
    flair_id: number;
    flair_name: string;
    flair_shortname: string;
    ai: boolean;
    licenses: IRacingLicense[];
  }[];
  member_since: string;
};

export type IRacingSeriesResultsResponse = {
  session_id: number;
  subsession_id: number;
  start_time: string;
  end_time: string;
  license_category_id: number;
  license_category: string;
  num_drivers: number;
  num_cautions: number;
  num_caution_laps: number;
  num_lead_changes: number;
  event_average_lap: number;
  event_best_lap_time: number;
  event_laps_complete: number;
  driver_changes: boolean;
  winner_group_id: number;
  winner_name: string;
  winner_ai: boolean;
  track: {
    config_name: string;
    track_id: number;
    track_name: string;
  };
  official_session: boolean;
  season_id: number;
  season_year: number;
  season_quarter: number;
  event_type: number;
  event_type_name: string;
  series_id: number;
  series_name: string;
  series_short_name: string;
  race_week_num: number;
  event_strength_of_field: number;
};

export type IRacingSessionResult = {
  session_id: number;
  subsession_id: number;
  race_week_num: number;
  car_classes: {
    car_class_id: number;
    short_name: string;
    name: string;
    num_entries: number;
    strength_of_field: number;
  }[];
  driver_changes: boolean;
  event_best_lap_time: number;
  event_strength_of_field: number;
  event_type: number;
  event_type_name: string;
  farm: {
    farm_id: number;
    display_name: string;
    image_path: string;
    displayed: boolean;
  };
  num_caution_laps: number;
  num_cautions: number;
  num_drivers: number;
  num_lead_changes: number;
  official_session: boolean;
  start_time: string;
  track: {
    config_name: string;
    track_id: number;
    track_name: string;
  };
  winner_helmet: {
    pattern: number;
    color1: string;
    color2: string;
    color3: string;
    face_type: number;
    helmet_type: number;
  };
  winner_id: number;
  winner_license_level: number;
  winner_name: string;
};

// =============================================================================
// INPUT/PARAMETER TYPES
// =============================================================================

// =============================================================================
// LICENSE & DISCIPLINE TYPES
// =============================================================================

// export type LicenseClass = "A" | "B" | "C" | "D" | "R";

// export type TransformLicenseData = {
//   ovalIRating: number;
//   ovalSafetyRating: string;
//   ovalLicenseClass: LicenseClass;
//   sportsCarIRating: number;
//   sportsCarSafetyRating: string;
//   sportsCarLicenseClass: LicenseClass;
//   formulaCarIRating: number;
//   formulaCarSafetyRating: string;
//   formulaCarLicenseClass: LicenseClass;
//   dirtOvalIRating: number;
//   dirtOvalSafetyRating: string;
//   dirtOvalLicenseClass: LicenseClass;
//   dirtRoadIRating: number;
//   dirtRoadSafetyRating: string;
//   dirtRoadLicenseClass: LicenseClass;
// };

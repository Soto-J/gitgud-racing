import { InferSelectModel } from "drizzle-orm";

import { inferRouterOutputs } from "@trpc/server";
import { licenseTable, userChartDataTable } from "@/db/schema";

import { AppRouter } from "@/trpc/routers/_app";

export type UserGetOne = inferRouterOutputs<AppRouter>["iracing"]["getUser"];

export type WeeklySeriesResults =
  inferRouterOutputs<AppRouter>["iracing"]["weeklySeriesResults"];

// Init
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
export type IRacingFetchResult = {
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
  licenses: InferSelectModel<typeof licenseTable> | null;
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

export type IracingSeriesResultsResponse = {
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

export type IracingGetAllSeriesResponse = {
  allowed_licenses: {
    group_name: string;
    license_group: number;
    max_license_level: number;
    min_license_level: number;
  }[];
  category: string;
  category_id: number;
  eligible: boolean;
  first_season: {
    season_year: number;
    season_quarter: number;
  };
  forum_url: string;
  max_starters: number;
  min_starters: number;
  oval_caution_type: number;
  road_caution_type: number;
  series_id: number;
  series_name: string;
  series_short_name: string;
};

export type CacheWeeklyResultsInput = {
  authCode: string;
  params: {
    series_id: string;
    season_year: string;
    season_quarter: string;
    event_types: string;
    official_only: boolean;
    race_week_num: string;
    start_range_begin: string;
    start_range_end: string;
    cust_id: string;
    team_id: string;
    category_id: string;
    include_series: string;
  };
};

export type ResultsList = {
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
export type SeasonResultsResponse = {
  success: boolean;
  season_id: number;
  race_week_num: number;
  event_type: number;
  results_list: ResultsList[];
};

// Chart Data

export type ChartData =
  inferRouterOutputs<AppRouter>["iracing"]["userChartData"];
export type ChartDataRecord = typeof userChartDataTable.$inferSelect;
export type UserChartDataResponse = {
  blackout: boolean;
  category_id: number;
  chart_type: number;
  data: {
    when: Date;
    value: number;
  }[];
  success: boolean;
  cust_id: number;
};

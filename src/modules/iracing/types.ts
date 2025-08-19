import { InferSelectModel } from "drizzle-orm";

import { inferRouterOutputs } from "@trpc/server";
import { licenseTable } from "@/db/schema";

import { AppRouter } from "@/trpc/routers/_app";

export type UserGetOne = inferRouterOutputs<AppRouter>["iracing"]["getUser"];

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

export type IracingGetSeriesResultsResponse = {
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

// export type IracingGetAllSeriesResponse = {
//   season_id: number;
//   season_name: string;
//   active: boolean;
//   allowed_season_members: string | null;
//   car_class_ids: number[];
//   car_switching: boolean;
//   car_types: { car_type: string }[];
//   caution_laps_do_not_count: boolean;
//   complete: boolean;
//   connection_black_flag: boolean;
//   consec_caution_within_nlaps: number;
//   consec_cautions_single_file: boolean;
//   cross_license: boolean;
//   distributed_matchmaking: boolean;
//   driver_change_rule: number;
//   driver_changes: boolean;
//   drops: number;
//   enable_pitlane_collisions: boolean;
//   fixed_setup: boolean;
//   green_white_checkered_limit: number;
//   grid_by_class: boolean;
//   hardcore_level: number;
//   has_supersessions: boolean;
//   ignore_license_for_practice: boolean;
//   incident_limit: number;
//   incident_warn_mode: number;
//   incident_warn_param1: number;
//   incident_warn_param2: number;
//   is_heat_racing: boolean;
//   license_group: number;
//   license_group_types: { license_group_type: number }[];
//   lucky_dog: boolean;
//   max_team_drivers: number;
//   max_weeks: number;
//   min_team_drivers: number;
//   multiclass: boolean;
//   must_use_diff_tire_types_in_race: boolean;
//   next_race_session: string;
//   num_fast_tows: number;
//   num_opt_laps: number;
//   official: boolean;
//   op_duration: number;
//   open_practice_session_type_id: number;
//   qualifier_must_start_race: boolean;
//   race_week: number;
//   race_week_to_make_divisions: string;
//   reg_user_count: number;
//   region_competition: boolean;
//   restrict_by_member: boolean;
//   restrict_to_car: boolean;
//   restrict_viewing: boolean;
//   schedule_description: string;
//   schedules: {
//     season_id: number;
//     race_week_num: number;
//     car_restrictions: {
//       car_id: number;
//       max_dry_tire_sets: number;
//       max_pct_fuel_fill: number;
//       power_adjust_pct: number;
//       weight_penalty_kg: number;
//     }[];
//     category: "oval" | "sports_car" | "dirt_oval" | "dirt_road" | "formula_car";
//     category_id: number;
//     enable_pitlane_collisions: boolean;
//     full_course_cautions: boolean;
//     practice_length: number;
//     qual_attached: boolean;
//     qualify_laps: number;
//     qualify_length: number;
//     race_lap_limit: number;
//     race_time_descriptors: {
//       day_offset: number[];
//       first_session_time: string;
//       repeat_minutes: number;
//       repeating: boolean;
//       session_minutes: number;
//       start_date: string;
//       super_session: boolean;
//     }[];
//     race_time_limit: number | null;
//     race_week_car_class_ids: number[];
//     race_week_cars: string[];
//     restart_type: string;
//     schedule_name: string;
//     season_name: string;
//     series_id: number;
//     series_name: string;
//     short_parade_lap: boolean;
//     special_event_type: string | null;
//     start_date: string;
//     start_type: string;
//     start_zone: boolean;
//     track: {
//       category: "oval" | "sports_car" | "dirt_oval" | "formula_car";
//       category_id: number;
//       config_name: string;
//       track_id: number;
//       track_name: string;
//     };
//     track_state: { leave_marbles: boolean };
//     warmup_length: number;
//     weather: {
//       allow_fog: boolean;
//       forecast_options: {
//         allow_fog: boolean;
//         forecast_type: number;
//         precipitation: number;
//         skies: number;
//         stop_precip: number;
//         temperature: number;
//         weather_seed: number;
//         wind_dir: number;
//         wind_speed: number;
//       };
//       precip_option: number;
//       rel_humidity: number;
//       simulated_start_time: string;
//       simulated_time_multiplier: number;
//       simulated_time_offsets: number[];
//       skies: number;
//       temp_units: number;
//       temp_value: number;
//       time_of_day: number;
//       track_water: number;
//       version: number;
//       weather_summary: {
//         max_precip_rate: number;
//         max_precip_rate_desc: string;
//         precip_chance: number;
//         skies_high: number;
//         skies_low: number;
//         temp_high: number;
//         temp_low: number;
//         temp_units: number;
//         wind_dir: number;
//         wind_high: number;
//         wind_low: number;
//         wind_units: number;
//       };
//       weather_url: string;
//       wind_dir: number;
//       wind_units: number;
//       wind_value: number;
//     };
//     week_end_time: string;
//   }[];
//   season_quarter: number;
//   season_short_name: string;
//   season_year: number;
//   send_to_open_practice: boolean;
//   series_id: number;
//   short_parade_lap: boolean;
//   start_date: string;
//   start_on_qual_tire: boolean;
//   start_zone: boolean;
//   track_types: { track_type: string }[];
//   unsport_conduct_rule_mode: number;
// }[];

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

export type SeasonResultsResponse = {
  session_id: number;
  subsession_id: number;
  race_week_num: number;
  car_classes: {
    car_class_id: 74;
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

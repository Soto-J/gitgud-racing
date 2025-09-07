import { z } from "zod";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const IRacingGetUserRecentRacesInputSchema = z.object({
  custId: z.string().min(1, { message: "Id is required" }),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const IRacingGetUserRecentRacesResponseSchema = z.object({
  races: z.array(
    z.object({
      season_id: z.number(),
      series_id: z.number(),
      series_name: z.string(),
      car_id: z.number(),
      car_class_id: z.number(),
      livery: z.object({
        car_id: z.number(),
        pattern: z.number(),
        color1: z.string(),
        color2: z.string(),
        color3: z.string(),
      }),
      license_level: z.number(),
      session_start_time: z.string(),
      winner_group_id: z.number(),
      winner_name: z.string(),
      winner_helmet: z.object({
        pattern: z.number(),
        color1: z.string(),
        color2: z.string(),
        color3: z.string(),
        face_type: z.number(),
        helmet_type: z.number(),
      }),
      winner_license_level: z.number(),
      start_position: z.number(),
      finish_position: z.number(),
      qualifying_time: z.number(),
      laps: z.number(),
      laps_led: z.number(),
      incidents: z.number(),
      points: z.number(),
      strength_of_field: z.number(),
      subsession_id: z.number(),
      old_sub_level: z.number(),
      new_sub_level: z.number(),
      oldi_rating: z.number(),
      newi_rating: z.number(),
      track: z.object({
        track_id: z.number(),
        track_name: z.string(),
      }),
      drop_race: z.boolean(),
      season_year: z.number(),
      season_quarter: z.number(),
      race_week_num: z.number(),
    }),
  ),
  cust_id: z.number(),
});

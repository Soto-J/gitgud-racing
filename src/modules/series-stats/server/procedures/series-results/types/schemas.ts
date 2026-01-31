import { z } from "zod";

export const SeriesSeasonsSchema = z.object({});


// export const ChunkResponseSchema = z.array(
//   z.object({
//     // Session-level fields (always present)
//     session_id: z.number(),
//     subsession_id: z.number(),
//     start_time: z.string(),
//     end_time: z.string(),
//     license_category_id: z.number(),
//     license_category: z.string(),
//     num_drivers: z.number(),
//     num_cautions: z.number(),
//     num_caution_laps: z.number(),
//     num_lead_changes: z.number(),
//     event_average_lap: z.number(),
//     event_best_lap_time: z.number(),
//     event_laps_complete: z.number(),
//     driver_changes: z.boolean(),
//     winner_group_id: z.number(),
//     winner_name: z.string(),
//     winner_ai: z.boolean(),
//     track: z.object({
//       config_name: z.string(),
//       track_id: z.number(),
//       track_name: z.string(),
//     }),
//     official_session: z.boolean(),
//     season_id: z.number(),
//     season_year: z.number(),
//     season_quarter: z.number(),
//     event_type: z.number(),
//     event_type_name: z.string(),
//     series_id: z.number(),
//     series_name: z.string(),
//     series_short_name: z.string(),
//     race_week_num: z.number(),
//     event_strength_of_field: z.number(),
//     season_license_group: z.number(),
//     season_license_group_name: z.string(),

//     // Driver-specific fields (only present when cust_id is provided)
//     cust_id: z.number().optional(),
//     starting_position: z.number().optional(),
//     finish_position: z.number().optional(),
//     starting_position_in_class: z.number().optional(),
//     finish_position_in_class: z.number().optional(),
//     laps_complete: z.number().optional(),
//     laps_led: z.number().optional(),
//     incidents: z.number().optional(),
//     car_class_id: z.number().optional(),
//     car_id: z.number().optional(),
//     car_class_name: z.string().optional(),
//     car_class_short_name: z.string().optional(),
//     car_name: z.string().optional(),
//     car_name_abbreviated: z.string().optional(),
//     champ_points: z.number().optional(),
//     drop_race: z.boolean().optional(),
//   }),
// );

import { z } from "zod";

export const SeriesSeasonsSchema = z.object({});

/**
 * Official series.
 * Maximum time frame of 90 days. Results split into one or more files with chunks of results.
 * For scraping results the most effective approach is to keep track of the maximum end_time found during
 * a search then make the subsequent call using that date/time as the finish_range_begin and skip any
 * subsessions that are duplicated. Results are ordered by subsessionid which is a proxy for start time
 * but groups together multiple splits of a series when multiple series launch sessions at the same time.
 * Requires at least one of: season_year and season_quarter, start_range_begin, finish_range_begin.
 */
export const ResultsSeriesParamsSchema = z.object({
  // Required when using season_quarter
  season_year: z.number().optional(),
  // Required when using season_year
  season_quarter: z.number().optional(),

  // Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\"
  start_range_begin: z.string().optional(),
  // ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past
  start_range_end: z.string().optional(),

  // Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\"
  finish_range_begin: z.string().optional(),
  // ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past
  finish_range_end: z.string().optional(),

  // Only sessions in which this customer participated. Ignored if team_id is supplied
  cust_id: z.number().optional(),
  // Only sessions in which this team participated. Takes priority over cust_id if both are supplied
  team_id: z.number().optional(),
  // Only sessions for series with this ID
  series_id: z.number().optional(),
  // Only sessions with this race week number
  race_week_num: z.number().optional(),

  // If true, include only sessions earning championship points. Defaults to false
  official_only: z.boolean().optional(),

  // Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5
  event_types: z.number().optional(),
  // License categories to include in the search. Defaults to all. ?category_ids=1,2,3,4
  category_ids: z.number().optional(),
});

export const ResultsSeriesSearchResponseSchema = z.object({
  type: z.string(),

  data: z.object({
    success: z.boolean(),
    chunk_info: z.object({
      chunk_size: z.number(),
      num_chunks: z.number(),
      rows: z.number(),
      base_download_url: z.string(),
      chunk_file_names: z.array(z.string()),
    }),
    params: z.object({
      cust_id: z.number().optional(),
      category_ids: z.array(z.number()),
      season_year: z.number(),
      season_quarter: z.number(),
      official_only: z.boolean(),
      event_types: z.array(z.number()),
      season_license_groups: z.array(z.number()).optional(),
    }),
  }),
});

export const ChunkResponseSchema = z.array(
  z.object({
    // Session-level fields (always present)
    session_id: z.number(),
    subsession_id: z.number(),
    start_time: z.string(),
    end_time: z.string(),
    license_category_id: z.number(),
    license_category: z.string(),
    num_drivers: z.number(),
    num_cautions: z.number(),
    num_caution_laps: z.number(),
    num_lead_changes: z.number(),
    event_average_lap: z.number(),
    event_best_lap_time: z.number(),
    event_laps_complete: z.number(),
    driver_changes: z.boolean(),
    winner_group_id: z.number(),
    winner_name: z.string(),
    winner_ai: z.boolean(),
    track: z.object({
      config_name: z.string(),
      track_id: z.number(),
      track_name: z.string(),
    }),
    official_session: z.boolean(),
    season_id: z.number(),
    season_year: z.number(),
    season_quarter: z.number(),
    event_type: z.number(),
    event_type_name: z.string(),
    series_id: z.number(),
    series_name: z.string(),
    series_short_name: z.string(),
    race_week_num: z.number(),
    event_strength_of_field: z.number(),
    season_license_group: z.number(),
    season_license_group_name: z.string(),

    // Driver-specific fields (only present when cust_id is provided)
    cust_id: z.number().optional(),
    starting_position: z.number().optional(),
    finish_position: z.number().optional(),
    starting_position_in_class: z.number().optional(),
    finish_position_in_class: z.number().optional(),
    laps_complete: z.number().optional(),
    laps_led: z.number().optional(),
    incidents: z.number().optional(),
    car_class_id: z.number().optional(),
    car_id: z.number().optional(),
    car_class_name: z.string().optional(),
    car_class_short_name: z.string().optional(),
    car_name: z.string().optional(),
    car_name_abbreviated: z.string().optional(),
    champ_points: z.number().optional(),
    drop_race: z.boolean().optional(),
  }),
);

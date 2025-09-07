import z from "zod";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Schema for fetching all series data with optional season filtering
 * Defaults to current year and quarter if not provided
 */
export const GetAllSeriesInput = z.object({
  season_year: z
    .string()
    .regex(/^\d{4}$/, "Season year must be a 4-digit year")
    .optional()
    .transform((v) => v ?? new Date().getFullYear().toString()),
  season_quarter: z
    .string()
    .regex(/^[1-4]$/, "Season quarter must be 1, 2, 3, or 4")
    .optional()
    .transform(
      (v) => v ?? Math.ceil((new Date().getMonth() + 1) / 3).toString(),
    ),
  include_series: z.boolean().default(true),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const GetAllSeriesResponse = z.array(
  z.object({
    allowed_licenses: z.array(
      z.object({
        group_name: z.string(),
        license_group: z.number(),
        max_license_level: z.number(),
        min_license_level: z.number(),
      }),
    ),
    category: z.string(),
    category_id: z.number(),
    eligible: z.boolean(),
    first_season: z.object({
      season_year: z.number(),
      season_quarter: z.number(),
    }),
    forum_url: z.string(),
    max_starters: z.number(),
    min_starters: z.number(),
    oval_caution_type: z.number(),
    road_caution_type: z.number(),
    series_id: z.number(),
    series_name: z.string(),
    series_short_name: z.string(),
  }),
);

export type GetAllSeriesResponseType = z.infer<
  typeof GetAllSeriesResponse
>;

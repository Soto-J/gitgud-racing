import z from "zod";

export const IRacingGetAllSeriesResponseSchema = z.object({
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
});

export type IRacingGetAllSeriesResponse = z.infer<
  typeof IRacingGetAllSeriesResponseSchema
>;

import { z } from "zod";

export const SeasonListSchema = z.object({
  season_quarter: z.number(),
  seasons: z.array(
    z.object({
      season_id: z.number(),
      series_id: z.number(),
      season_name: z.string(),
      series_name: z.string(),
      official: z.boolean(),
      season_year: z.number(),
      season_quarter: z.number(),
      license_group: z.number(),
      fixed_setup: z.boolean(),
      driver_changes: z.boolean(),
    }),
  ),
  season_year: z.number(),
});
// season_id 6013

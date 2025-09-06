import z from "zod";

/**
 * Schema for fetching all series data with optional season filtering
 * Defaults to current year and quarter if not provided
 */
export const IRacingGetAllSeriesInputSchema = z.object({
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

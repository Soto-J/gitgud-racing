import z from "zod";

export const IracingLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  userId: z.string(),
});

export const CustomerIdSchema = z.object({
  customerId: z.number(),
});

export const GetUserInputSchema = z.object({
  userId: z.string().nullish(),
});

export const GetAllSeriesInputSchema = z.object({
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

export const GetSeriesResultsInputSchema = z.object({
  series_id: z.string().nullish(),
  season_year: z.string().nullish(),
  season_quarter: z.string().nullish(),
  event_types: z.string().nullish(),
  official_only: z.boolean().nullish(),
  race_week_num: z.string().nullish(),
  start_range_begin: z.string().nullish(),
  start_range_end: z.string().nullish(),
  cust_id: z.string().nullish(),
  team_id: z.string().nullish(),
  category_id: z.string().nullish(),
});

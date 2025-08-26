import z from "zod";

export const IracingLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password required" }),
  userId: z.string().min(1, { message: "Id is required" }),
});

export const CustomerIdSchema = z.object({
  customerId: z.string().min(1, { message: "Id is required" }),
});

export const GetUserInputSchema = z.object({
  userId: z.string().min(1, { message: "Id is required" }),
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

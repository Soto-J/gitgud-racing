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

export const GetSeasonInputSchema = z.object({
  seasonYear: z
    .string()
    .regex(/^\d{4}$/, "Season year must be a 4-digit year")
    .default(new Date().getFullYear().toString()),
  seasonQuarter: z
    .string()
    .regex(/^[1-4]$/, "Season quarter must be 1, 2, 3, or 4")
    .default(Math.ceil((new Date().getMonth() + 1) / 3).toString()),
});

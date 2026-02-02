import { z } from "zod";

export const SeriesAssetSchema = z.object({
  large_image: z.string().optional(),
  logo: z.string().optional(),
  series_copy: z.string().optional(),
  series_id: z.number(),
  small_image: z.string().optional(),
});

export const SeriesAssetsResponseSchema = z.record(
  z.string(),
  SeriesAssetSchema,
);

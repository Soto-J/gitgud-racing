import { z } from "zod";

import { SeriesAssetsResponseSchema, SeriesAssetSchema } from "./schema";

export type SeriesAssetsResponse = z.infer<typeof SeriesAssetsResponseSchema>;
export type SeriesAsset = z.infer<typeof SeriesAssetSchema>;

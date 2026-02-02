import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";

import type { SeriesAssetsResponse } from "./types";
import { SeriesAssetsResponseSchema } from "./types/schemas";

export async function fetchSeriesAssets(): Promise<SeriesAssetsResponse> {
  const accessToken = await getAccessToken();

  const response = await fetchData<SeriesAssetsResponse>(
    "/data/series/assets",
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  return SeriesAssetsResponseSchema.parse(response.data);
}

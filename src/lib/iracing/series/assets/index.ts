import fs from "fs/promises";
import path from "path";

import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";

import type { SeriesAssetsResponse } from "./types";
import { SeriesAssetsResponseSchema } from "./types/schema";

const IRACING_IMAGE_BASE =
  "https://images-static.iracing.com/img/logos/series/";
const SERIES_ASSETS_DIR = path.join(process.cwd(), "public/series-assets");

export async function fetchSeriesAssets(): Promise<SeriesAssetsResponse> {
  const accessToken = await getAccessToken();
  
  const response = await fetchData<SeriesAssetsResponse>(
    "/data/series/assets",
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  const data = SeriesAssetsResponseSchema.parse(response.data);
  await downloadSeriesAssets(data);
  return data;
}

async function downloadSeriesAssets(assets: SeriesAssetsResponse) {
  await fs.mkdir(SERIES_ASSETS_DIR, { recursive: true });

  const entries = Object.values(assets).filter((asset) => asset.logo);

  const results = await Promise.allSettled(
    entries.map(async (asset) => {
      const originalFileName = asset.logo!;
      const normalizedFileName = `seriesid_${asset.series_id}.png`;
      const filePath = path.join(SERIES_ASSETS_DIR, normalizedFileName);

      try {
        await fs.access(filePath);
        return { seriesId: asset.series_id, status: "skipped" as const };
      } catch {
        // File doesn't exist, proceed with download
      }

      const response = await fetch(`${IRACING_IMAGE_BASE}${originalFileName}`);

      if (!response.ok) {
        throw new Error(
          `Failed to download ${originalFileName}: ${response.status}`,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      return { seriesId: asset.series_id, status: "downloaded" as const };
    }),
  );

  const downloaded = results.filter(
    (r) => r.status === "fulfilled" && r.value.status === "downloaded",
  ).length;

  const skipped = results.filter(
    (r) => r.status === "fulfilled" && r.value.status === "skipped",
  ).length;

  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `Series assets: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`,
  );
}

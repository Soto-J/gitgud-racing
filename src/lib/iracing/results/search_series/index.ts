import { z } from "zod";

import { fetchData } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";

import type { ChunkResponse, SeriesResultsParams } from "./types";
import {
  ChunkResponseSchema,
  SeriesResultsResponseSchema,
} from "./types/schemas";

type FetchResult =
  | { success: true; data: ChunkResponse }
  | { success: false; error: string };

export async function fetchSeriesResults(
  searchParams: SeriesResultsParams,
): Promise<FetchResult> {
  let accessToken: string;

  try {
    console.log("[SeriesResults] Retrieving access token.");
    accessToken = await getAccessToken();
  } catch (error) {
    console.error("[SeriesResults] Failed to acquire access token:", error);
    return { success: false, error: "Token acquisition failed" };
  }

  let response;

  try {
    const initialUrl =
      "/data/results/search_series" +
      buildSearchParams({
        ...searchParams,
      });

    response = await fetchData(initialUrl, accessToken);

    if (!response.ok) {
      console.error("[SeriesResults] iRacing API error:", response.error);
      return { success: false, error: `iRacing API error: ${response.error}` };
    }
  } catch (error) {
    console.error("[SeriesResults] Failed to fetch iRacing data:", error);
    return { success: false, error: "API request failed" };
  }

  const initialPayload = SeriesResultsResponseSchema.safeParse(response.data);

  if (!initialPayload.success) {
    console.warn(
      "[SeriesResults] Schema validation failed:",
      z.treeifyError(initialPayload.error),
    );
    console.warn("Raw response:", JSON.stringify(response, null, 2));

    return { success: false, error: initialPayload.error.message };
  }

  const { base_download_url, chunk_file_names } =
    initialPayload.data.data.chunk_info;

  if (chunk_file_names.length === 0) {
    return { success: false, error: "[SeriesResults] Chunkfiles empty" };
  }

  const chunkPromises = chunk_file_names.map(async (fileName) => {
    const chunkUrl = base_download_url + fileName;

    const chunkResponse = await fetch(chunkUrl);

    if (!chunkResponse.ok) {
      console.error("URL:", chunkUrl);
      throw new Error(
        `Failed to fetch chunk ${fileName}: ${chunkResponse.statusText}`,
      );
    }

    return chunkResponse.json();
  });

  const chunkResults = await Promise.allSettled(chunkPromises);

  const failed = chunkResults.filter(
    (r) => r.status === "rejected",
  ) as PromiseRejectedResult[];

  if (failed.length > 0) {
    console.error(
      "[SeriesResults] Failed chunks:",
      failed.map((f) => f.reason),
    );
    return { success: false, error: "Failed to fetch all chunk files" };
  }

  const fulfilledData = chunkResults
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const chunkPayload = ChunkResponseSchema.safeParse(fulfilledData);

  if (!chunkPayload.success) {
    return {
      success: false,
      error: `[SeriesResults] ${chunkPayload.error.message}`,
    };
  }

  return { success: true, data: chunkPayload.data };
}

export function buildSearchParams(params: SeriesResultsParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Convert arrays to comma-separated strings for iRacing API
      const paramValue = Array.isArray(value) ? value.join(",") : String(value);
      searchParams.append(key, paramValue);
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

import { TRPCError } from "@trpc/server";

import { IRACING_URL } from "./config";

/**
 * Error mapping configuration for iRacing API responses
 * Maps specific error patterns to appropriate TRPC error codes
 */
const ERROR_MAPPINGS = [
  {
    includes: "401",
    code: "UNAUTHORIZED" as const,
    message: "iRacing authentication failed.",
  },
  {
    includes: "404",
    code: "NOT_FOUND" as const,
    message: "Requested iRacing resource not found.",
  },
  {
    includes: "Failed to parse",
    code: "PARSE_ERROR" as const,
    message: "Failed to parse iRacing API response.",
  },
];

/**
 * Fetches data from the iRacing API with authentication and error handling
 *
 * This function handles the complex iRacing API flow which may involve:
 * 1. Initial request that returns a link for data download
 * 2. Following the link to get the actual data
 * 3. Special handling for search_series_results with chunk files
 *
 * @param params - Parameters for the API request
 * @param params.query - The API endpoint query string (e.g., "/data/series/get")
 * @param params.authCode - Valid iRacing authentication code
 *
 * @returns {Promise<unknown>} The fetched data from iRacing API
 *
 * @throws {TRPCError}
 * - UNAUTHORIZED: Authentication failed or expired
 * - NOT_FOUND: Requested resource not found
 * - PARSE_ERROR: Failed to parse API response
 * - INTERNAL_SERVER_ERROR: Network errors or other failures
 *
 * @example
 * ```typescript
 * const authCode = await getOrRefreshAuthCode();
 * const series = await fetchData({
 *   query: "/data/series/get",
 *   authCode
 * });
 * ```
 */
export const fetchData = async ({
  query,
  authCode,
}: {
  query: string;
  authCode: string;
}): Promise<unknown> => {
  try {
    const initialResponse = await fetch(`${IRACING_URL}${query}`, {
      headers: {
        Cookie: `authtoken_members=${authCode}`,
      },
    });

    if (!initialResponse.ok) {
      throw new Error(
        `Initial fetch failed, Status: ${initialResponse.status}`,
      );
    }

    const data = await initialResponse.json();

    // Documentation doesn't require a link
    if (!data?.link && data.type !== "search_series_results") {
      return data;
    }

    let link = data?.link ?? "";

    // Special handling for search_series_results
    if (data?.type === "search_series_results") {
      const chunkInfo = data.data.chunk_info;

      const baseDownloadUrl = chunkInfo.base_download_url;
      const [chunkFileNames] = chunkInfo.chunk_file_names;

      if (!chunkFileNames) {
        throw new Error("No chunk file names found");
      }

      link = `${baseDownloadUrl}${chunkFileNames}`;
      console.log("Download URL:", link);
    }

    if (!link) {
      throw new Error("No download link available from iRacing response.");
    }

    try {
      const linkResponse = await fetch(link);

      if (!linkResponse.ok) {
        throw new Error(
          `Failed to fetch data from the provided link. Status ${linkResponse.status}`,
        );
      }

      const linkData = await linkResponse.json();

      return linkData;
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : typeof downloadError === "string"
            ? downloadError
            : "Unknown error occurred while downloading iRacing data.";

      throw new Error(message);
    }
  } catch (error) {
    console.error("iRacing API error:", error);

    if (error instanceof Error) {
      // Map specific errors to TRPC codes
      for (const mapping of ERROR_MAPPINGS) {
        if (error.message.includes(mapping.includes)) {
          throw new TRPCError({
            code: mapping.code,
            message: mapping.message,
          });
        }
      }

      // Default error
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unknown error occurred while fetching iRacing data.",
    });
  }
};

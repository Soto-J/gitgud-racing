import { TRPCError } from "@trpc/server";

import { IRACING_URL } from "@/constants";
import { API_TIMEOUT_MS } from "@/modules/iracing/constants";

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
  if (!authCode || authCode.trim() === "") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or missing iRacing authentication code",
    });
  }

  if (!query || query.trim() === "") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid or missing API query parameter",
    });
  }

  console.log(`Making iRacing API request to: ${query}`);
  try {
    const initialResponse = await fetch(`${IRACING_URL}${query}`, {
      headers: {
        Cookie: `authtoken_members=${authCode}`,
      },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    if (!initialResponse.ok) {
      console.error("Failed to read error response body:");
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
      const linkResponse = await fetch(link, {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });

      if (!linkResponse.ok) {
        let linkErrorBody = "";
        let linkErrorMessage = `Failed to fetch data from the provided link. Status ${linkResponse.status}`;

        try {
          linkErrorBody = await linkResponse.text();
          console.error("iRacing Link Fetch Error Details:", {
            status: linkResponse.status,
            statusText: linkResponse.statusText,
            url: link,
            headers: Object.fromEntries(linkResponse.headers.entries()),
            body: linkErrorBody,
          });

          if (linkErrorBody) {
            linkErrorMessage += ` - Response: ${linkErrorBody.substring(0, 200)}`;
          }
        } catch (bodyError) {
          console.error("Failed to read link error response body:", bodyError);
        }

        throw new Error(linkErrorMessage);
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

    // If it's already a TRPC error, re-throw it
    if (error instanceof TRPCError) {
      throw error;
    }

    if (error instanceof Error) {
      // Handle timeout errors specifically
      if (error.name === "TimeoutError" || error.message.includes("timeout")) {
        throw new TRPCError({
          code: "TIMEOUT",
          message: "iRacing API request timed out. Please try again.",
        });
      }

      // Handle network errors
      if (
        error.message.includes("fetch") &&
        (error.message.includes("network") ||
          error.message.includes("connection"))
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Network error connecting to iRacing API. Please check your connection.",
        });
      }

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

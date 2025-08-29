/**
 * Configuration constants for iRacing integration
 *
 * This file contains all the configuration values used throughout the iRacing module
 * to maintain consistency and make updates easier.
 */

/** Base URL for iRacing API endpoints */
export const IRACING_URL = "https://members-ng.iracing.com";

/** Base URL for iRacing static images */
export const IRACING_IMAGE_URL = "https://images-static.iracing.com";

/** Duration in milliseconds for caching series and weekly results */
export const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Timeout duration for API requests in milliseconds */
export const API_TIMEOUT_MS = 10000; // 10 seconds

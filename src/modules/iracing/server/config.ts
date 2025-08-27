/**
 * Configuration constants for iRacing integration
 *
 * This file contains all the configuration values used throughout the iRacing module
 * to maintain consistency and make updates easier.
 */

/** Base URL for iRacing API endpoints */
export const IRACING_URL =
  process.env.IRACING_URL || "https://members-ng.iracing.com";

/** Base URL for iRacing static images */
export const IRACING_IMAGE_URL = "https://images-static.iracing.com";

/** Duration in milliseconds that iRacing auth cookies remain valid */
export const COOKIE_EXPIRES_IN_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Duration in milliseconds for caching series and weekly results */
export const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Timeout duration for API requests in milliseconds */
export const API_TIMEOUT_MS = 10000; // 10 seconds

/**
 * @fileoverview Parameter definitions and search parameter handling for weekly series results
 *
 * This module defines:
 * - Pagination constants and limits
 * - Search parameter parsers and defaults
 * - URL search parameter loader configuration
 */

import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

// =============================================================================
// PAGINATION CONSTANTS
// =============================================================================

/** Default page number for pagination */
export const DEFAULT_PAGE = 1;

/** Default number of results per page */
export const DEFAULT_PAGE_SIZE = 5;

/** Minimum allowed page size */
export const MIN_PAGE_SIZE = 1;

/** Maximum allowed page size to prevent performance issues */
export const MAX_PAGE_SIZE = 100;

// =============================================================================
// SEARCH PARAMETER CONFIGURATION
// =============================================================================

/**
 * Search parameter parsers for weekly series results filtering
 *
 * Defines how URL search parameters are parsed and validated,
 * with appropriate defaults and clear-on-default behavior.
 *
 * @example
 * ```typescript
 * // URL: /series?search=formula&page=2
 * // Parsed as: { search: "formula", page: 2 }
 * ```
 */
export const filtersSearchParams = {
  /** Search term for filtering series/track names */
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

  /** Current page number for pagination */
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
};

/**
 * Pre-configured loader for parsing search parameters
 *
 * Creates a type-safe loader that can extract and validate
 * search parameters from URL query strings.
 *
 * @example
 * ```typescript
 * const searchParams = loadSearchParams(request);
 * console.log(searchParams.search); // Type-safe access
 * ```
 */
export const loadSearchParams = createLoader(filtersSearchParams);

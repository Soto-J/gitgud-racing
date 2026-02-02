import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

import { DEFAULT_PAGE } from "./schemas";

export const filtersSearchParams = {
  /** Search term for filtering series/track names */
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

  /** Current page number for pagination */
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),

  seasonYear: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  seasonQuarter: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  raceWeek: parseAsInteger
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

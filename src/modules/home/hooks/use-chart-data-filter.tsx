import { DEFAULT_PAGE } from "@/constants";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

// if input is empty clears URL to default ""
// E.g. http://localhost:3000/agents?search=test
//  =>  http://localhost:3000/agents
export const useChartDataFilters = () =>
  useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),

    memberId: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
  });

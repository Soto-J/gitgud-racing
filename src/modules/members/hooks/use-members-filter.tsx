import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/modules/members/server/procedures/get-many/params";

// if input is empty clears URL to default ""
// E.g. http://localhost:3000/agents?search=test
//  =>  http://localhost:3000/agents
export const useMembersFilters = () =>
  useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
  });

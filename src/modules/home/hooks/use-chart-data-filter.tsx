"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { DEFAULT_PAGE } from "@/modules/home/constants";

// if input is empty clears URL to default ""
// E.g. http://localhost:3000/agents?search=test
//  =>  http://localhost:3000/agents
export const useChartFilter = () => {
  const trpc = useTRPC();

  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
  });
};

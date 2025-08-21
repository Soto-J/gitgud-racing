"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useChartDataFilters } from "@/modules/home/hooks/use-chart-data-filter";

import { ChartPagination } from "./chart-pagination";
import { ChartSearchFilter } from "./chart-search-filter";

export const HomeHeader = () => {
  const [filters, setFilters] = useChartDataFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }),
  );
  return (
    <>
      <div className="mb-6 py-8 text-center">
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Series Statistics Overview
        </h2>
        <p className="text-muted-foreground">
          Average entrants and splits per week
        </p>
      </div>

      <ChartSearchFilter />

      <ChartPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
    </>
  );
};

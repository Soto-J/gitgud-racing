"use client";

import { XCircleIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useChartFilter } from "@/modules/iracing/hooks/use-chart-data-filter";
import { DEFAULT_PAGE } from "@/modules/manage/constants";

import { ChartSearchFilter } from "./chart-search-filter";
import { ChartPagination } from "./chart-pagination";

import { Button } from "@/components/ui/button";

export default function SeriesResultsHeader() {
  const [filters, setFilters] = useChartFilter();

  const trpc = useTRPC();
  // const { data } = useSuspenseQuery(
  // trpc.seriesStats.totalSeriesCount.queryOptions({ ...filters }),
  // trpc.seriesResults.resultsSearchSeries.queryOptions({}),
  // );
  // console.log({ data });
  const isFilterActive = !!filters.search;

  const onClearFilters = () =>
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });

  return (
    <>
      <div className="text-foreground relative mb-8 rounded-2xl bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-12 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/iRacing-Brandmarks/iRacing-Icon-BW-White.svg')] bg-[length:250px] bg-center bg-no-repeat opacity-10" />

        <div className="relative z-10 text-center">
          <div className="bg-muted/20 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            iRacing Series Analytics
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Series Statistics Overview
          </h1>

          <p className="text-lg font-medium text-blue-100">
            Track performance across all racing series with real-time data
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 pt-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-center gap-3">
          <ChartSearchFilter />

          {isFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-primary/70 border-border hover:bg-red-50 hover:text-red-800"
            >
              <XCircleIcon className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
        <ChartPagination
          page={filters.page}
          totalPages={0}
          onPageChange={(page) => setFilters({ page })}
        />
      </div>
    </>
  );
}

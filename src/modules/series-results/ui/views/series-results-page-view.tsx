"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { XCircleIcon } from "lucide-react";

import { useChartFilter } from "@/modules/series-results/hooks/use-chart-data-filter";

import { DEFAULT_PAGE } from "../../server/procedures/search-series-results/types/schemas";

import SeriesChart from "@/modules/series-results/ui/components/series-chart";
import ChartPagination from "@/modules/series-results/ui/components/chart-pagination";
import ChartFilterInput from "../components/chart-filter-input";
import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";

import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export const SeriesResultsPageView = () => {
  const [filters, setFilters] = useChartFilter();
  const isFilterActive = !!filters.search;

  const trpc = useTRPC();
  const { data: searchData } = useSuspenseQuery(
    trpc.seriesResults.searchSeriesResults.queryOptions({}),
  );

  const { paginatedSeries, totalPages } = useMemo(() => {
    const allSeries = searchData.series;
    const startIndex = (filters.page - 1) * PAGE_SIZE;
    const paginatedSeries = allSeries.slice(startIndex, startIndex + PAGE_SIZE);
    const totalPages = Math.ceil(allSeries.length / PAGE_SIZE);

    return { paginatedSeries, totalPages };
  }, [searchData.series, filters.page]);

  const onClearFilters = () =>
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-3">
          <ChartFilterInput />

          {isFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-primary/70 border-border hover:primary hover:bg-primary"
            >
              <XCircleIcon className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        <ChartPagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      </div>

      <SeriesChart data={{ series: paginatedSeries }} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group border-border relative overflow-hidden rounded-2xl border bg-linear-to-br from-blue-50 to-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-blue-100 opacity-20" />

          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />

              <span className="text-xs font-medium text-blue-700">TOTAL</span>
            </div>

            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Total Pages
            </h3>

            <p className="text-3xl font-bold text-gray-900">
              {/* {data.totalPages} */}
            </p>
            <div className="mt-2 text-xs text-gray-500">Available series</div>
          </div>
        </div>

        <div className="group border-border relative overflow-hidden rounded-2xl border bg-linear-to-br from-green-50 to-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-green-100 opacity-20" />

          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-green-700">
                ENTRANTS
              </span>
            </div>

            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Avg Entrants
            </h3>

            <p className="text-3xl font-bold text-gray-900">
              {/* {data.data.length === 0
                ? "0.0"
                : (
                    data.series.reduce(
                      (acc, item) => acc + parseFloat(item.averageEntrants),
                      0,
                    ) / data.series.length
                  ).toFixed(1)} */}
            </p>
            <div className="mt-2 text-xs text-gray-500">Per race session</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-purple-50 to-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-purple-100 opacity-20" />

          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-purple-500" />

              <span className="text-xs font-medium text-purple-700">
                SPLITS
              </span>
            </div>

            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Avg Splits
            </h3>

            <p className="text-3xl font-bold text-gray-900">
              {/* {data.series.length === 0
                ? "0.0"
                : (
                    data.series.reduce(
                      (acc, item) => acc + parseFloat(item.averageSplits),
                      0,
                    ) / data.series.length
                  ).toFixed(1)} */}
            </p>

            <div className="mt-2 text-xs text-gray-500">Per time slot</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoadingSeriesResultsView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorSeriesResultsView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

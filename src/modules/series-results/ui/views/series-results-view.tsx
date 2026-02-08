"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useChartFilter } from "@/modules/series-results/hooks/use-chart-data-filter";

import ChartToolbar from "@/modules/series-results/ui/components/series-results-chart/chart-toolbar";
import SeriesResultsChart from "@/modules/series-results/ui/components/series-results-chart";
import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";

const PAGE_SIZE = 10;

export const SeriesResultsView = () => {
  const [filters] = useChartFilter();

  const trpc = useTRPC();
  const { data: searchData } = useSuspenseQuery(
    trpc.seriesResults.searchSeriesResults.queryOptions({}),
  );

  const { paginatedSeries, totalPages } = useMemo(() => {
    const allSeries = searchData.series;

    const searchValue = filters.search.trim().toLowerCase();

    const filteredSeries = searchValue
      ? allSeries.filter(
          (series) =>
            series.name.toLowerCase().includes(searchValue) ||
            series.trackName?.toLowerCase().includes(searchValue),
        )
      : allSeries;

    const totalPages = Math.max(
      1,
      Math.ceil(filteredSeries.length / PAGE_SIZE),
    );

    const safePage = Math.min(filters.page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    const paginatedSeries = filteredSeries.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );

    return { paginatedSeries, totalPages };
  }, [searchData.series, filters.page, filters.search]);

  return (
    <div className="space-y-8 p-6">
      <ChartToolbar totalPages={totalPages} />
      <SeriesResultsChart data={{ series: paginatedSeries }} />
    </div>
  );
};

export const LoadingSeriesResultsView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorSeriesResultsView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

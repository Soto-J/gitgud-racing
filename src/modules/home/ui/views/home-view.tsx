"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useChartFilter } from "@/modules/home/hooks/use-chart-data-filter";

import { ChartPagination } from "@/modules/home/ui/components/chart-pagination";
import { SeriesChart } from "@/modules/home/ui/components/series-chart";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export const HomeView = () => {
  const [filters, setFilters] = useChartFilter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }),
  );

  console.log(data);
  return (
    <div className="bg-background p-6">
      <ChartPagination
        page={filters.page}
        onPageChange={(page) => setFilters({ page })}
        totalPages={data.totalPages}
      />
      
      <SeriesChart data={data} />

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-muted-foreground text-sm font-medium">
            Total Series
          </h3>
          <p className="text-2xl font-bold">{data.totalPages}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-muted-foreground text-sm font-medium">
            Avg Entrants
          </h3>
          <p className="text-2xl font-bold">
            {(
              data.series.reduce(
                (acc, item) => acc + parseFloat(item.averageEntrants),
                0,
              ) / data.series.length
            ).toFixed(1)}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-muted-foreground text-sm font-medium">
            Avg Splits
          </h3>
          <p className="text-2xl font-bold">
            {(
              data.series.reduce(
                (acc, item) => acc + parseFloat(item.averageSplits),
                0,
              ) / data.series.length
            ).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const LoadingHomeView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorHomeView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

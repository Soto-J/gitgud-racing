"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useChartFilter } from "@/modules/home/hooks/use-chart-data-filter";

import { SeriesChart } from "@/modules/home/ui/components/series-chart";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export const HomeView = () => {
  const [filters, _] = useChartFilter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }),
  );

  console.log(data);
  return (
    <div className="space-y-8 p-6">
      {/* Main Chart Section */}
      <div className="rounded-2xl border border-gray-200 bg-white px-8 pt-8 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Series Performance
            </h2>
            <p className="text-gray-600">Weekly averages across all series</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-700">Live Data</span>
          </div>
        </div>

        <SeriesChart data={data} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-blue-100 opacity-20"></div>
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-blue-700">TOTAL</span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Total Series
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {data.totalPages}
            </p>
            <div className="mt-2 text-xs text-gray-500">Available series</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-green-100 opacity-20"></div>
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-green-700">
                ENTRANTS
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Avg Entrants
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {(
                data.series.reduce(
                  (acc, item) => acc + parseFloat(item.averageEntrants),
                  0,
                ) / data.series.length
              ).toFixed(1)}
            </p>
            <div className="mt-2 text-xs text-gray-500">Per race session</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-purple-100 opacity-20"></div>
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-xs font-medium text-purple-700">
                SPLITS
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Avg Splits
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {(
                data.series.reduce(
                  (acc, item) => acc + parseFloat(item.averageSplits),
                  0,
                ) / data.series.length
              ).toFixed(1)}
            </p>
            <div className="mt-2 text-xs text-gray-500">Per time slot</div>
          </div>
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

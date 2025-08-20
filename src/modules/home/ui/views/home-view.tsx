"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useChartDataFilters } from "@/modules/home/hooks/use-chart-data-filter";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartPagination } from "../components/chart-pagination";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  averageEntrants: {
    label: "Avg Entrants",
    color: "#2563eb",
  },
  averageSplits: {
    label: "Avg # of splits",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export const HomeView = () => {
  const [filters, setFilters] = useChartDataFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.iracing.weeklySeriesResults.queryOptions(),
  );

  console.log(data);
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        {/* Chart Header */}
        <div className="mb-6 py-8 text-center">
          <h2 className="text-foreground mb-2 text-2xl font-bold">
            Series Statistics Overview
          </h2>
          <p className="text-muted-foreground">
            Average entrants and splits per week
          </p>
        </div>

        <ChartPagination
          page={filters.page}
          totalPages={0}
          onPageChange={(page) => setFilters({ page })}
        />

        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <BarChart
            accessibilityLayer
            data={data.slice(0, 12)} // Show only 12 months at a time
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={16}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0} // Show all ticks
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(1) : value,
                    name === "averageEntrants"
                      ? " Avg Entrants"
                      : " Avg Splits",
                  ]}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent />}
              wrapperStyle={{ paddingTop: "20px" }}
            />

            <Bar
              dataKey="averageEntrants"
              fill="var(--color-averageEntrants)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              dataKey="averageSplits"
              fill="var(--color-averageSplits)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Total Months
            </h3>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Avg Entrants
            </h3>
            <p className="text-2xl font-bold">
              {(
                data.reduce(
                  (acc, item) => acc + parseFloat(item.averageEntrants),
                  0,
                ) / data.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Avg Splits
            </h3>
            <p className="text-2xl font-bold">
              {(
                data.reduce(
                  (acc, item) => acc + parseFloat(item.averageSplits),
                  0,
                ) / data.length
              ).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

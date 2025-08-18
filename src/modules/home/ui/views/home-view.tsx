"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", averageEntrants: 186, averageSplits: 80 },
  { month: "February", averageEntrants: 305, averageSplits: 200 },
  { month: "March", averageEntrants: 237, averageSplits: 120 },
  { month: "April", averageEntrants: 73, averageSplits: 190 },
  { month: "May", averageEntrants: 209, averageSplits: 130 },
  { month: "June", averageEntrants: 214, averageSplits: 140 },
];

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

interface HomeViewProps {
  queryOptions: {
    season_year: string;
    season_quarter: string;
  };
}

export const HomeView = ({ queryOptions }: HomeViewProps) => {
  // const trpc = useTRPC();
  // const { data } = useSuspenseQuery(
  //   trpc.iracing.getSeriesResults.queryOptions({ ...queryOptions }),
  // );

  // console.log(data);
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center">
      <ChartContainer config={chartConfig} className="h-[500px] w-[80%]">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />

          <Bar
            dataKey="averageEntrants"
            fill="var(--color-averageEntrants)"
            radius={4}
          />
          <Bar
            dataKey="averageSplits"
            fill="var(--color-averageSplits)"
            radius={4}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";

import { WeeklySeriesResults } from "@/modules/iracing/types";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  averageEntrants: {
    label: "Avg Entrants",
    color: "hsl(217, 91%, 60%)",
  },
  averageSplits: {
    label: "Avg # of splits",
    color: "hsl(142, 76%, 36%)",
  },
} satisfies ChartConfig;

interface SeriesChartProps {
  data: WeeklySeriesResults;
}

export const SeriesChart = ({ data }: SeriesChartProps) => {
  return (
    <div className="relative">
      <ChartContainer config={chartConfig} className="h-[500px] w-full">
        <BarChart
          accessibilityLayer
          data={data.series}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >

          <CartesianGrid
            vertical={false}
            strokeDasharray="2 4"
            stroke="hsl(var(--muted-foreground))"
            opacity={0.2}
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={20}
            axisLine={false}
            angle={-45}
            height={90}
            interval={0}
            tick={<ImageTick />}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            width={60}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg"
                formatter={(value, name) => [
                  typeof value === "number" ? value.toFixed(1) : value,
                  name === "averageEntrants" ? " Avg Entrants" : " Avg Splits",
                ]}
              />
            }
          />
          <ChartLegend
            content={<ChartLegendContent className="mt-4" />}
          />

          <Bar
            dataKey="averageEntrants"
            fill="var(--color-averageEntrants)"
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
          <Bar
            dataKey="averageSplits"
            fill="var(--color-averageSplits)"
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

const ImageTick = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}) => {
  if (!payload?.value) {
    return null;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <image
        x={-25}
        y={0}
        href={`/Official_Series_Logos/logos/${payload.value.trim()}.png`}
        className="h-6 w-6 md:h-10 md:w-10"
      />
    </g>
  );
};

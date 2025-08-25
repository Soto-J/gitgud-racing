import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";

import { cn } from "@/lib/utils";

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
    <div className="rounded-2xl border border-gray-200 bg-white px-8 pt-8 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Series Performance
          </h2>
          <p className="text-gray-600">Weekly averages across all series</p>
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="h-[500px] w-full cursor-pointer"
      >
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
                className="rounded-lg border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm"
                formatter={(value, name, { color }) => {
                  const isAvgSplit = name === "averageEntrants";
                  const label = isAvgSplit ? "Avg Splits" : "Avg Entrants";

                  return (
                    <div className="flex items-center gap-x-2">
                      <span
                        className={cn(
                          "h-2 w-2",
                          isAvgSplit
                            ? `bg-[hsl(142,76%,36%)]`
                            : "bg-[hsl(217,91%,60%)]",
                        )}
                      ></span>

                      <span>
                        {label}:{" "}
                        {typeof value === "number" ? value.toFixed(1) : value}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent className="mt-4" />} />

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
        className="h-6 w-6 cursor-pointer md:h-10 md:w-10"
        onClick={() => console.log(payload.value)}
      />
    </g>
  );
};

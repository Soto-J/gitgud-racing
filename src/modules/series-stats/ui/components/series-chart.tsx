import { useRouter } from "next/navigation";

import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";

import { cn } from "@/lib/utils";

import { WeeklySeriesResults } from "@/modules/iracing/server/procedures/weekly-series-results/schema";

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
    color: "hsl(220, 70%, 50%)",
  },
  averageSplits: {
    label: "Avg # of splits",
    color: "hsl(160, 60%, 45%)",
  },
} satisfies ChartConfig;

interface SeriesChartProps {
  data: WeeklySeriesResults;
}

export const SeriesChart = ({ data }: SeriesChartProps) => {
  const seasonYear = data.series[0]?.seasonYear || "0";
  const seasonQuarter = data.series[0]?.seasonQuarter || "0";
  const seasonWeek = data.series[0]?.raceWeek || "0";

  const isEmpty = data.series.length === 0;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/30 p-3 shadow-xl transition-all duration-300 hover:border-gray-200 hover:shadow-2xl sm:rounded-3xl sm:p-8">
      <div className="mb-4 flex flex-col items-center gap-2 sm:mb-6 sm:flex-row sm:justify-between sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />

          <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-3xl">
            Series Performance
          </h2>
        </div>

        {!isEmpty && (
          <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 sm:px-4 sm:py-2 sm:text-sm">
            {seasonYear} S{seasonQuarter} • Week {seasonWeek} / 13
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex h-[300px] w-full items-center justify-center sm:h-[400px] lg:h-[500px]">
          <div className="text-center">
            <div className="mb-3 text-6xl text-gray-300">📊</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-600">
              No series found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search filters or check back later
            </p>
          </div>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full transition-all duration-300 group-hover:scale-[1.02] sm:h-[400px] lg:h-[500px]"
        >
          <BarChart
            accessibilityLayer
            data={data.series}
            margin={{ top: 25, right: 4, left: -40, bottom: 40 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 6"
              stroke="hsl(220, 13%, 91%)"
              opacity={0.8}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              angle={-45}
              height={60}
              interval={0}
              tick={<ImageTick data={data} />}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 11,
                fill: "hsl(220, 9%, 46%)",
                fontWeight: 500,
              }}
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl border border-gray-100 bg-white/98 shadow-xl backdrop-blur-md"
                  labelFormatter={(label, payload) => {
                    const trackName = payload?.[0]?.payload?.trackName;

                    return (
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {label}
                        </div>

                        <div className="border-b border-gray-200 pb-1">
                          {trackName}
                        </div>
                      </div>
                    );
                  }}
                  formatter={(value, name) => {
                    const isAvgSplit = name === "averageEntrants";
                    const label = isAvgSplit ? "Avg Splits" : "Avg Entrants";

                    return (
                      <div className="flex items-center gap-x-3">
                        <span
                          className={cn(
                            "h-3 w-3 rounded-full",
                            isAvgSplit
                              ? "bg-[hsl(160,60%,45%)]"
                              : "bg-[hsl(220,70%,50%)]",
                          )}
                        />

                        <span className="font-medium text-gray-900">
                          {label}:{" "}
                          {typeof value === "number" ? value.toFixed(1) : value}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <ChartLegend
              content={
                <ChartLegendContent className="mt-6 text-sm font-medium" />
              }
            />

            <Bar
              dataKey="averageEntrants"
              fill="var(--color-averageEntrants)"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="averageSplits"
              fill="var(--color-averageSplits)"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

const ImageTick = ({
  x,
  y,
  payload,
  data,
}: {
  x?: number;
  y?: number;
  payload?: {
    value: string;
    coordinate: number;
    index: number;
    offset: number;
  };
  data?: WeeklySeriesResults;
}) => {
  const router = useRouter();

  if (!payload?.value) {
    return null;
  }

  const handleImageClick = () => {
    const seriesData = data?.series.find(
      (series) => series.name === payload.value,
    );

    if (!seriesData?.seriesId) {
      return;
    }

    router.push(`/home/${seriesData.seriesId}`);
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <image
        x={-20}
        y={0}
        href={`/Official_Series_Logos/logos/${payload.value.trim()}.png`}
        className="h-8 w-8 cursor-pointer rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg md:h-12 md:w-12"
        onClick={handleImageClick}
      />
    </g>
  );
};

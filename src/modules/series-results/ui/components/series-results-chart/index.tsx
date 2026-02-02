import { XAxis, YAxis, Bar, BarChart } from "recharts";

import { BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SearchSeriesResults } from "@/modules/series-results/server/procedures/search-series-results/types";

import ImageTick from "./image-tick";
import ToolTip from "./tooltip";
import {
  chartConfig,
  xAxisConfig,
  yAxisConfig,
  barChartMargin,
} from "./config";

import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const containerStyles = cn(
  "group border-border rounded-2xl border p-3 shadow-xl transition-all duration-300 hover:border-gray-200 hover:shadow-2xl sm:rounded-3xl sm:p-8",
  "from-foreground bg-linear-to-br to-muted",
);

interface SeriesChartProps {
  data: SearchSeriesResults;
}

export default function SeriesResultsChart({ data }: SeriesChartProps) {
  if (data.series.length === 0) {
    return <EmptyState />;
  }

  const { seasonYear, seasonQuarter, raceWeek } = data.series[0];

  return (
    <div className={containerStyles}>
      <div className="flex flex-col items-center gap-2 sm:mb-6 sm:flex-row sm:justify-between sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="to-primary h-1 w-8 rounded-full bg-linear-to-r from-blue-500" />

          <h2 className="text-muted text-xl font-bold sm:text-2xl lg:text-3xl">
            Series Performance
          </h2>
        </div>

        <div className="bg-chart-4 text-muted rounded-full px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
          {seasonYear} S{seasonQuarter} • Week {raceWeek + 1} / 13
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="h-[300px] w-full transition-all duration-300 group-hover:scale-[1.02] sm:h-[400px] lg:h-[500px]"
      >
        <BarChart
          accessibilityLayer
          data={data.series}
          layout="vertical"
          margin={barChartMargin}
        >
          <XAxis {...xAxisConfig} />
          <YAxis {...yAxisConfig} tick={<ImageTick data={data} />} />
          <ChartTooltip content={<ToolTip />} />

          <ChartLegend
            content={
              <ChartLegendContent className="mt-6 text-sm font-medium" />
            }
          />

          <Bar
            dataKey="avgEntrantsPerRace"
            fill="var(--color-avgEntrantsPerRace)"
            radius={5}
          />
          <Bar
            dataKey="avgSplitsPerRace"
            fill="var(--color-avgSplitsPerRace)"
            radius={5}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface ChartHeaderProps {
  seasonYear: number;
  seasonQuarter: number;
  raceWeek: number;
}

function EmptyState() {
  return (
    <div className={containerStyles}>
      <div className="flex h-[300px] w-full items-center justify-center sm:h-[400px] lg:h-[500px]">
        <div className="text-center">
          <div className="mb-3 text-6xl text-gray-300">
            <BarChart3 />
          </div>
          <h3 className="text-muted mb-2 text-lg font-semibold">
            No series found
          </h3>
          <p className="text-muted text-sm">
            Try adjusting your search filters or check back later
          </p>
        </div>
      </div>
    </div>
  );
}

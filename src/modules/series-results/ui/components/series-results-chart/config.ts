import { XAxisProps, YAxisProps } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

export const chartConfig = {
  avgEntrantsPerRace: {
    label: "Avg Entrants",
    color: "hsl(220, 70%, 50%)",
  },
  avgSplitsPerRace: {
    label: "Avg # of splits",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const xAxisConfig: XAxisProps = {
  type: "number" as const,
  domain: [0, "dataMax"],
  axisLine: false,
  fontSize: 12,
  fontWeight: 100,
  tickMargin: 10,
  stroke: "var(--chart-3)",
  tick: {
    stroke: "var(--chart-3)",
    letterSpacing: 1,
  },
};

export const yAxisConfig: YAxisProps = {
  dataKey: "name" as const,
  type: "category" as const,
  tickLine: false,
  tickMargin: 0,
  axisLine: false,
};

export const barChartMargin = {
  left: 20,
  top: 15,
  right: 100,
};

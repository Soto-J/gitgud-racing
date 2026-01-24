"use client";

import { cn } from "@/lib/utils";

import ChartHeader from "./chart-header";
import ChartFooter from "./chart-footer";
import ChartBody from "./chart-body";

interface RatingsChartProps {
  data: {
    when: Date;
    value: number;
  }[];
  title: string;
  chartType: string;
}

export default function RatingsChart({
  data,
  title,
  chartType,
}: RatingsChartProps) {
  if (data.length === 0) {
    return <div>No chart data available</div>;
  }

  const sortedByDate = [...data].sort((a, b) => +a.when - +b.when);

  const latestEntry = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(sortedByDate[sortedByDate.length - 1].when);

  return (
    <div
      className={cn(
        "border-border rounded border shadow-2xl",
        "from-muted via-muted to-muted/40 bg-linear-to-br",
      )}
    >
      <ChartHeader
        latestEntry={latestEntry}
        title={title}
        chartType={chartType}
        numberOfPoints={sortedByDate.length}
      />

      <ChartBody dataPoints={sortedByDate} />
      <ChartFooter
        latestEntry={latestEntry}
        numberOfPoints={sortedByDate.length}
      />
    </div>
  );
}

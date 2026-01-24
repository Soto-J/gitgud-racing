"use client";

import { DateTime } from "luxon";

import ChartHeader from "./chart-header";
import ChartFooter from "./chart-footer";
import ChartBody from "./chart-body";

export const parseDateTime = (dateValue: string | Date): DateTime => {
  if (typeof dateValue === "string") {
    return DateTime.fromISO(dateValue);
  } else if (dateValue instanceof Date) {
    return DateTime.fromJSDate(dateValue);
  } else if (typeof dateValue === "number") {
    return DateTime.fromMillis(dateValue);
  } else {
    throw new Error("Unsupported date value");
  }
};

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

  const sortedByDate = [...data].sort(
    (a, b) =>
      parseDateTime(a.when).toMillis() - parseDateTime(b.when).toMillis(),
  );

  const latestEntry = sortedByDate[sortedByDate.length - 1];
  const formattedDate = parseDateTime(latestEntry.when).toFormat(
    "MMM dd, yyyy",
  );
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 shadow-2xl">
      <ChartHeader
        date={formattedDate}
        title={title}
        chartType={chartType}
        numberOfPoints={sortedByDate.length}
      />

      <ChartBody dataPoints={sortedByDate} />
      <ChartFooter date={formattedDate} numberOfPoints={sortedByDate.length} />
    </div>
  );
}

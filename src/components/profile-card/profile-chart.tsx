"use client";

import { TrendingUp } from "lucide-react";

import { DateTime } from "luxon";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartData } from "@/modules/iracing/types";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface ProfileChartProps {
  data: ChartData[keyof ChartData]["chartData"];
  title: string;
}

const parseDateTime = (dateValue: string | Date): DateTime => {
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

export const ProfileChart = ({ data, title }: ProfileChartProps) => {
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-30" />
      <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-gradient-to-br from-green-100 to-blue-100 opacity-20" />

      <div className="relative">
        {/* Header with gradient accent */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>

              <div className="mt-1 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                  {latestEntry.chartType}
                </div>
                <div>
                  Last Entry: {formattedDate} • {sortedByDate.length} data
                  points
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <ChartContainer
            config={chartConfig}
            className="h-64 w-full rounded-xl"
          >
            <AreaChart
              accessibilityLayer
              data={sortedByDate}
              margin={{ left: -10, right: 15, top: 20, bottom: 20 }}
              className="rounded-xl"
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="when"
                tickMargin={16}
                className="text-xs"
                interval="preserveStartEnd"
                minTickGap={60}
                tickFormatter={(value) => {
                  const date = parseDateTime(value);

                  if (!date.isValid) {
                    return String(value);
                  }

                  const startDate = parseDateTime(sortedByDate[0].when);

                  // End date sometimes returns an object
                  const endDate = parseDateTime(
                    sortedByDate[sortedByDate.length - 1].when,
                  );

                  const dataSpan = endDate.diff(startDate, "days").days;

                  if (dataSpan > 365) {
                    return date.toFormat("MMM yyyy");
                  } else if (dataSpan > 30) {
                    return date.toFormat("MMM dd");
                  } else {
                    return date.toFormat("MMM dd");
                  }
                }}
                tick={{
                  fill: "#6b7280",
                  fontSize: 11,
                  fontWeight: 500,
                  dy: 4,
                }}
                tickLine={{
                  stroke: "#e5e7eb",
                  strokeWidth: 1,
                }}
                axisLine={{
                  stroke: "#f3f4f6",
                  strokeWidth: 1,
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs"
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--color-value)", strokeWidth: 2 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = parseDateTime(label);

                    const tooltipFormattedDate = date.isValid
                      ? date.toFormat("MMM dd, yyyy")
                      : String(label);

                    return (
                      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                        <p className="text-sm font-medium text-gray-900">
                          {tooltipFormattedDate}
                        </p>

                        <p className="text-sm text-gray-600">
                          iRating:{" "}
                          <span className="font-semibold">
                            {payload[0].value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={3}
                fill="url(#colorGradient)"
                dot={{
                  r: 4,
                  stroke: "var(--color-value)",
                  strokeWidth: 2,
                  fill: "white",
                }}
                activeDot={{
                  r: 6,
                  stroke: "var(--color-value)",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Footer with stats */}
        <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"></div>
              <span>Latest: {formattedDate}</span>
            </div>
            <div className="text-gray-500">
              {sortedByDate.length} total entries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

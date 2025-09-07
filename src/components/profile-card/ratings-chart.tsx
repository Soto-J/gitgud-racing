"use client";

import { TrendingUp } from "lucide-react";

import { DateTime } from "luxon";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartData } from "@/modules/iracing/server/procedures/user-chart-data/schema";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "value",
    color: "#DC143C", // Ferrari red
  },
} satisfies ChartConfig;

interface ProfileChartProps {
  data: ChartData[];
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

export const RatingsChart = ({ data, title }: ProfileChartProps) => {
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
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 shadow-2xl">
      {/* Subtle racing-themed decorative elements */}
      <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br from-red-600/10 to-red-400/5 opacity-60" />
      <div className="absolute bottom-0 left-0 h-16 w-16 -translate-x-4 translate-y-4 rounded-full bg-gradient-to-br from-red-500/5 to-red-600/10 opacity-40" />

      <div className="relative">
        {/* Compact header with Ferrari accent */}
        <div className="border-b border-gray-700/50 bg-gradient-to-r from-slate-900/90 to-slate-800/90 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-400"></span>
                  {latestEntry.chartType}
                </div>
                <div>
                  {formattedDate} • {sortedByDate.length} points
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <ChartContainer
            config={chartConfig}
            className="h-56 w-full rounded-lg [&_.recharts-cartesian-axis-tick_text]:!fill-gray-300"
          >
            <AreaChart
              accessibilityLayer
              data={sortedByDate}
              margin={{ left: -10, right: 15, top: 20, bottom: 20 }}
              className="rounded-xl"
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC143C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#DC143C" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#4B5563"
                vertical={false}
              />
              <XAxis
                dataKey="when"
                tickMargin={16}
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
                  fill: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 600,
                  dy: 4,
                }}
                tickLine={{
                  stroke: "#4B5563",
                  strokeWidth: 1,
                }}
                axisLine={{
                  stroke: "#374151",
                  strokeWidth: 1,
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#FFFFFF", fontSize: 12, fontWeight: 600 }}
              />
              <ChartTooltip
                cursor={{ stroke: "#DC143C", strokeWidth: 2 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = parseDateTime(label);

                    const tooltipFormattedDate = date.isValid
                      ? date.toFormat("MMM dd, yyyy")
                      : String(label);

                    return (
                      <div className="rounded-lg border border-gray-600 bg-slate-800 p-2.5 shadow-xl backdrop-blur">
                        <p className="text-xs font-medium text-white">
                          {tooltipFormattedDate}
                        </p>
                        <p className="text-xs text-gray-300">
                          iRating:{" "}
                          <span className="font-semibold text-red-400">
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
                stroke="#DC143C"
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={{
                  r: 3,
                  stroke: "#DC143C",
                  strokeWidth: 2,
                  fill: "#1e293b",
                }}
                activeDot={{
                  r: 5,
                  stroke: "#DC143C",
                  strokeWidth: 2,
                  fill: "#1e293b",
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="border-t border-gray-700/50 bg-gradient-to-r from-slate-800/90 to-slate-900/90 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400" />

              <span>Latest: {formattedDate}</span>
            </div>

            <div className="text-gray-500">{sortedByDate.length} entries</div>
          </div>
        </div>
      </div>
    </div>
  );
};

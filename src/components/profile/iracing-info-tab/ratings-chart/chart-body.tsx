import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const chartConfig = {
  value: {
    label: "value",
    color: "#DC143C", // Ferrari red
  },
} satisfies ChartConfig;

interface ChartBodyProps {
  dataPoints: {
    when: Date;
    value: number;
  }[];
}

export default function ChartBody({ dataPoints }: ChartBodyProps) {
  return (
    <div className="p-3">
      <ChartContainer
        config={chartConfig}
        className="h-56 w-full rounded-lg [&_.recharts-cartesian-axis-tick_text]:!fill-gray-300"
      >
        <AreaChart
          accessibilityLayer
          data={dataPoints}
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
            tickFormatter={(value) => {
              const startDate = dataPoints[0].when;
              const endDate = dataPoints[dataPoints.length - 1].when;

              const dataSpan = Math.floor(
                (Date.UTC(
                  endDate.getUTCFullYear(),
                  endDate.getUTCMonth(),
                  endDate.getUTCDate(),
                ) -
                  Date.UTC(
                    startDate.getUTCFullYear(),
                    startDate.getUTCMonth(),
                    startDate.getUTCDate(),
                  )) /
                  MS_PER_DAY,
              );

              const formatMonthYear = new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              });

              const formatMonthDay = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "2-digit",
              });

              return dataSpan > 365
                ? formatMonthYear.format(value)
                : formatMonthDay.format(value);
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
              if (!active || !payload) {
                return null;
              }

              const tooltipFormattedDate = new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
              }).format(label);

              return (
                <div className="space-y-2 rounded-lg border border-gray-600 bg-slate-800 p-2.5 shadow-xl backdrop-blur">
                  <p className="text-xs font-medium text-white">
                    {tooltipFormattedDate}
                  </p>
                  <p className="text-foreground text-xs font-semibold">
                    iRating:{" "}
                    <span className="text-primary font-medium">
                      {payload[0].value}
                    </span>
                  </p>
                </div>
              );
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
  );
}

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;

const chartConfig = {
  value: {
    label: "value",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface ChartBodyProps {
  dataPoints: {
    when: Date;
    value: number;
  }[];
}

export default function ChartBody({ dataPoints }: ChartBodyProps) {
  const toolTipFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  });
  const formatMonthYear = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });
  const formatMonthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  });

  const now = new Date();
  const startDate = dataPoints[0]?.when ?? now;
  const endDate = dataPoints[dataPoints.length - 1]?.when ?? now;

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

  const tickFormatter = (date: Date) => {
    return dataSpan > DAYS_IN_YEAR
      ? formatMonthYear.format(date)
      : formatMonthDay.format(date);
  };

  return (
    <div className="p-3">
      <ChartContainer
        config={chartConfig}
        className="h-56 w-full rounded-lg py-6 [&_.recharts-cartesian-axis-tick_text]:!fill-gray-300"
      >
        <AreaChart
          accessibilityLayer
          data={dataPoints}
          margin={{ left: -10, right: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
              <stop
                offset="95%"
                stopColor="var(--chart-1)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="2 4"
            stroke="var(--chart-4)"
            vertical={false}
          />
          <XAxis
            dataKey="when"
            tickMargin={16}
            interval="preserveStartEnd"
            minTickGap={60}
            tick={{ fontWeight: 500 }}
            tickFormatter={tickFormatter}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontWeight: 500 }}
          />

          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !label) {
                return null;
              }

              const date = toolTipFormatter.format(new Date(label));

              return (
                <div className="border-border space-y-2 rounded-lg border p-2.5 shadow-xl backdrop-blur">
                  <p className="text-secondary font-bold">{date}</p>

                  <span className="text-foreground">iRating: </span>
                  <span className="text-primary font-medium">
                    {payload[0].value}
                  </span>
                </div>
              );
            }}
          />

          <Area
            dataKey="value"
            type="monotone"
            stroke={"var(--chart-1)"}
            strokeWidth={2}
            fill="url(#colorGradient)"
            dot={{}}
            activeDot={{ r: 5, strokeWidth: 3, stroke: "var(--chart-2)" }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

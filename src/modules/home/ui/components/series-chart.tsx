import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";
import Image from "next/image";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import { WeeklySeriesResults } from "@/modules/iracing/types";

const chartConfig = {
  averageEntrants: {
    label: "Avg Entrants",
    color: "#2563eb",
  },
  averageSplits: {
    label: "Avg # of splits",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

interface SeriesChartProps {
  data: WeeklySeriesResults;
}

export const SeriesChart = ({ data }: SeriesChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="h-[500px] w-full">
      <BarChart
        accessibilityLayer
        data={data.series} // Show only 12 months at a time
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="hsl(var(--muted-foreground))"
          opacity={0.3}
        />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={16}
          axisLine={false}
          angle={-45}
          height={80}
          interval={0} 
          tick={<ImageTick />}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                typeof value === "number" ? value.toFixed(1) : value,
                name === "averageEntrants" ? " Avg Entrants" : " Avg Splits",
              ]}
            />
          }
        />

        <ChartLegend
          content={<ChartLegendContent />}
          wrapperStyle={{ paddingTop: "0px" }}
        />

        <Bar
          dataKey="averageEntrants"
          fill="var(--color-averageEntrants)"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          dataKey="averageSplits"
          fill="var(--color-averageSplits)"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ChartContainer>
  );
};

const ImageTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <image
        x={-15}
        y={0}
        width={30}
        height={30}
        href={`/Official_Series_Logos/Sports Car/${payload.value}.png`}
      />
    </g>
  );
}

    //  href={`https://images-static.iracing.com/seriesid_${payload.value}.png`}
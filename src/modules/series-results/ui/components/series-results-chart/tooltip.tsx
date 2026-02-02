import type { ComponentProps } from "react";

import { ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type TooltipProps = ComponentProps<typeof ChartTooltipContent>;

export default function ToolTip(props: TooltipProps) {
  return (
    <ChartTooltipContent
      {...props}
      className="bg-popover text-popover-foreground border-border rounded-xl border shadow-xl backdrop-blur-md"
      labelFormatter={(label, payload) => {
        const trackName = payload?.[0]?.payload?.trackName;

        return (
          <>
            <div className="text-popover-foreground text-sm font-semibold">
              {label}
            </div>
            <div className="border-border border-b pb-1">{trackName}</div>
          </>
        );
      }}
      formatter={(value, name) => {
        const isAvgEntrants = name === "avgEntrantsPerRace";
        const label = isAvgEntrants ? "Avg Entrants" : "Avg Splits";

        return (
          <div className="flex items-center gap-x-3">
            <span
              className={cn(
                "h-3 w-3 rounded-full",
                isAvgEntrants ? "bg-[hsl(220,70%,50%)]" : "bg-primary",
              )}
            />

            <span className="text-popover-foreground font-medium">
              {label}: {typeof value === "number" ? value.toFixed(1) : value}
            </span>
          </div>
        );
      }}
    />
  );
}

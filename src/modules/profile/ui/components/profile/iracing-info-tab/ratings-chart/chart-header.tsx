import { cn } from "@/lib/utils";

import { TrendingUp } from "lucide-react";

interface ChartHeaderProps {
  latestEntry: string;
  title: string;
  chartType: string;
  numberOfPoints: number;
}

export default function ChartHeader({
  title,
  latestEntry,
  chartType,
  numberOfPoints,
}: ChartHeaderProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground border-border border-b p-4",
        // "bg-linear-to-r from-slate-900/90 to-slate-800/90",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg shadow-lg",
            "from-primary to-primary/40 bg-linear-to-br",
          )}
        >
          <TrendingUp className="text-foreground h-5 w-5" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold capitalize">{title}</h3>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="bg-secondary inline-flex h-1.5 w-1.5 rounded-full" />
              <span className="">{chartType}</span>
            </div>
            <div>
              {latestEntry} • {numberOfPoints} points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

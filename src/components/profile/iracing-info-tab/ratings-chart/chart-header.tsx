import { TrendingUp } from "lucide-react";

interface ChartHeaderProps {
  date: string;
  title: string;
  chartType: string;
  numberOfPoints: number;
}

export default function ChartHeader({
  title,
  date,
  chartType,
  numberOfPoints,
}: ChartHeaderProps) {
  return (
    <div className="border-b border-gray-700/50 bg-linear-to-r from-slate-900/90 to-slate-800/90 p-4">
      <div className="flex items-center gap-3">
        <div className="from-primary to-primary/70 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br shadow-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-foreground text-lg font-bold capitalize">
            {title}
          </h3>

          <div className="text-foreground/90 flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="bg-secondary inline-flex h-1.5 w-1.5 rounded-full" />
              <span className="">{chartType}</span>
            </div>
            <div>
              {date} • {numberOfPoints} points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface ChartFooterProps {
  latestEntry: string;
  numberOfPoints: number;
}

export default function ChartFooter({
  latestEntry,
  numberOfPoints,
}: ChartFooterProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground font-mediu border-t border-gray-700/50 px-4 py-3",
        // "bg-linear-to-r from-slate-800/90 to-slate-900/90",
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-1.5 w-1.5 rounded-full" />
          <span>Latest: {latestEntry}</span>
        </div>

        <div className="">{numberOfPoints} entries</div>
      </div>
    </div>
  );
}

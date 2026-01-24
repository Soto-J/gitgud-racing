interface ChartFooterProps {
  date: string;
  numberOfPoints: number;
}

export default function ChartFooter({
  date,
  numberOfPoints,
}: ChartFooterProps) {
  return (
    <div className="border-t border-gray-700/50 bg-linear-to-r from-slate-800/90 to-slate-900/90 px-4 py-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />

          <span>Latest: {date}</span>
        </div>

        <div className="text-gray-500">{numberOfPoints} entries</div>
      </div>
    </div>
  );
}

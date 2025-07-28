import { cn } from "@/lib/utils";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  highlight = false,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        `relative rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105`,
        highlight
          ? "border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-md"
          : "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            `rounded-lg p-2`,
            highlight ? "bg-red-600 text-white" : "bg-gray-600 text-white",
          )}
        >
          <Icon size={20} />
        </div>

        <div>
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <div
            className={`font-bold ${highlight ? "text-red-700" : "text-gray-900"}`}
          >
            {value ? (
              <span>{value}</span>
            ) : (
              <span className="text-sm text-gray-400 italic">N/A</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

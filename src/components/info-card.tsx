import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accentColor: string;
}

export const InfoCard = ({
  icon: Icon,
  label,
  value,
  accentColor = "bg-gray-600",
}: InfoCardProps) => (
  <div className="rounded-xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
    <div className="flex items-center gap-3">
      <div className={`rounded-lg p-2 text-white ${accentColor}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="font-bold text-gray-900">
          {value ? (
            <span className="text-sm">{value}</span>
          ) : (
            <span className="text-sm text-gray-400 italic">N/A</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

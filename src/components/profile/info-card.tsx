import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accentColor: string;
}

export default function InfoCard({
  icon: Icon,
  label,
  value,
  accentColor = "bg-gray-600",
}: InfoCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 h-12 w-12 translate-x-2 -translate-y-2 rounded-full bg-gray-100 opacity-20 transition-transform duration-500 group-hover:scale-110"></div>

      <div className="relative flex items-start gap-4">
        <div
          className={`rounded-xl p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${accentColor}`}
        >
          <Icon size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            {label}
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
            {value ? (
              <span className="text-lg font-semibold break-words text-gray-900">
                {value}
              </span>
            ) : (
              <span className="text-lg font-medium text-gray-400 italic">
                Not provided
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

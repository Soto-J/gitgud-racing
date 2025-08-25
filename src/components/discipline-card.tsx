import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DisciplineCardProps {
  icon: LucideIcon;
  title: string;
  iRating: number;
  safetyRating: string;
  licenseClass: string;
}

const classColors = {
  R: "bg-[#fc0706]",
  D: "bg-orange-600",
  C: "bg-[#feec04]",
  B: "bg-green-600",
  A: "bg-blue-600",
  "A+": "bg-purple-600",
};

export const DisciplineCard = ({
  title,
  icon: Icon,
  iRating,
  safetyRating,
  licenseClass,
}: DisciplineCardProps) => {
  const accentColor = classColors[licenseClass as keyof typeof classColors];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-white hover:to-white">
      {/* Decorative background element */}
      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-20 transition-transform duration-500 group-hover:scale-110"></div>
      
      {/* Accent corner */}
      <div className={cn("absolute top-0 left-0 h-16 w-16 rounded-br-2xl opacity-10", accentColor)}></div>
      
      {/* Racing stripe */}
      <div className={cn("absolute top-0 left-0 h-full w-1 rounded-l-2xl", accentColor)}></div>

      {/* Header */}
      <div className="relative mb-6 flex items-center gap-3">
        <div className={cn("rounded-xl p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110", accentColor)}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Racing Category</p>
        </div>
      </div>

      {/* Stats */}
      <div className="relative space-y-4">
        {/* iRating */}
        <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">iRating</span>
            <div className="text-2xl font-bold text-gray-900">
              {iRating ? iRating.toLocaleString() : "—"}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          </div>
        </div>

        {/* Safety Rating */}
        <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Safety</span>
            <div className="text-2xl font-bold text-gray-900">
              {safetyRating ? safetyRating : "—"}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* License Class */}
        <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">License</span>
            <div className="mt-1">
              <span
                className={cn(
                  "inline-flex items-center justify-center h-8 w-8 rounded-full text-lg font-bold text-white shadow-md",
                  classColors[licenseClass as keyof typeof classColors] || "bg-gray-600",
                )}
              >
                {licenseClass}
              </span>
            </div>
          </div>
          <div className={cn("h-8 w-8 rounded-full opacity-20", accentColor)}></div>
        </div>
      </div>
    </div>
  );
};

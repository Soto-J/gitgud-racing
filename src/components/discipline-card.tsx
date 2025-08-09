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
    <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
      {/* Accent line */}
      <div
        className={cn(`absolute top-0 left-0 h-full w-1`, accentColor)}
      ></div>

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 text-white ${accentColor}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* iRating */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">iRating</span>
          <span className="text-lg font-bold text-gray-900">
            {iRating ? iRating.toLocaleString() : "—"}
          </span>
        </div>

        {/* Safety Rating */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Safety Rating
          </span>
          <span className="text-lg font-bold text-gray-900">
            {safetyRating ? safetyRating : "—"}
          </span>
        </div>

        {/* License Class */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">License</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                `rounded px-2 py-1 text-sm font-bold text-white`,
                classColors[licenseClass as keyof typeof classColors] ||
                  "bg-gray-600",
              )}
            >
              {licenseClass}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

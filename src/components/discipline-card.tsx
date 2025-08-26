"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DisciplineCardProps {
  title: string;
  iRating: number;
  safetyRating: string;
  licenseClass: string;
}

const getCategoryLogo = (category: string) => {
  const logoMap: Record<string, string> = {
    Oval: "/category/license-icon-oval-gradient.svg",
    Sports: "/category/license-icon-sport-gradient.svg",
    Formula: "/category/license-icon-formula-gradient.svg",
    "Dirt Oval": "/category/license-icon-dirtoval-gradient.svg",
    "Dirt Road": "/category/license-icon-dirtroad-gradient.svg",
  };

  return logoMap[category] || "/category/license-icon-sport-gradient.svg";
};

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
  iRating,
  safetyRating,
  licenseClass,
}: DisciplineCardProps) => {
  const router = useRouter();

  const label = title.split(" ").join("");
  const path = `/profile/${label}`;
  const logoSrc = getCategoryLogo(title);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-[#27313B] p-6 transition-all duration-200 hover:bg-[#2d3740] hover:shadow-lg"
      onClick={() => router.push(path)}
    >
      {/* Header */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-3">
          <Image
            src={logoSrc}
            alt={`${title} racing category logo`}
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-400">
            Racing Category
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {/* iRating */}
        <div className="text-center">
          <div className="text-xl font-bold text-white">
            {iRating ? iRating.toLocaleString() : "—"}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            iRating
          </div>
        </div>

        {/* Safety Rating */}
        <div className="text-center">
          <div className="text-xl font-bold text-white">
            {safetyRating || "—"}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Safety
          </div>
        </div>

        {/* License Class */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded text-sm font-bold text-white",
              classColors[licenseClass as keyof typeof classColors] || "bg-slate-600"
            )}
          >
            {licenseClass}
          </div>
          <div className="mt-1 text-xs text-slate-400 uppercase tracking-wide">
            License
          </div>
        </div>
      </div>
    </div>
  );
};
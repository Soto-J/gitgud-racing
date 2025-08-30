"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

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
  const logoSrc = getCategoryLogo(title);

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 hover:shadow-2xl">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-5 flex items-center space-x-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm">
            <Image
              src={logoSrc}
              alt={`${title} racing category logo`}
              width={26}
              height={26}
              className="h-9 w-9 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-start text-base font-bold text-white">
              {title}
            </h3>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* iRating */}
          <div className="text-center">
            <div className="mb-1 text-lg font-bold text-white">
              {iRating ? iRating.toLocaleString() : "—"}
            </div>
            <div className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              iRating
            </div>
          </div>

          {/* Safety Rating */}
          <div className="text-center">
            <div className="mb-1 text-lg font-bold text-white">
              {safetyRating || "—"}
            </div>
            <div className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Safety
            </div>
          </div>

          {/* License Class */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white shadow-lg transition-all duration-200 group-hover:scale-110",
                classColors[licenseClass as keyof typeof classColors] ||
                  "bg-slate-600",
              )}
            >
              {licenseClass}
            </div>
            <div className="mt-1.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              License
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

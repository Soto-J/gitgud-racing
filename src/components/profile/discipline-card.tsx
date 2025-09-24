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
    <div className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 hover:shadow-2xl">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-600/5 to-red-400/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center space-x-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-red-600/20 bg-gradient-to-br from-red-600/15 to-red-400/10 backdrop-blur-sm">
            <Image
              src={logoSrc}
              alt={`${title} racing category logo`}
              width={22}
              height={22}
              className="h-7 w-7 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-start text-sm font-bold text-white">
              {title}
            </h3>
            <div className="mt-0.5 h-0.5 w-6 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
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

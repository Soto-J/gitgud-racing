"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface DisciplineCardProps {
  categoryName: string;
  iRating: number;
  safetyRating: number;
  licenseClass: string;
  licenseColor: string;
  categoryImageSrc: string;
}

export default function DisciplineCard({
  categoryName,
  iRating,
  safetyRating,
  licenseClass,
  licenseColor,
  categoryImageSrc,
}: DisciplineCardProps) {
  return (
    <div
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl p-4 shadow-lg transition-all duration-300",
        "from-card via-card/50 bg-linear-to-br",
        "hover:card/20 hover:via-card/80 hover:to-secondary/40 via-40% hover:scale-[1.02] hover:shadow-2xl",
      )}
      style={
        {
          "--tw-gradient-to": licenseColor,
          "--tw-gradient-via-position": "70%",
          "--tw-gradient-to-position": "90%",
          "--tw-gradient-from-position": "80%",
        } as React.CSSProperties
      }
    >
      <div className="mb-4 flex items-center space-x-2.5">
        <div className="border-primary/20 from-primary/15 to-primary/10 flex h-12 w-12 items-center justify-center rounded-lg border bg-linear-to-br backdrop-blur-sm">
          <Image
            src={categoryImageSrc}
            alt={`${categoryName} racing category logo`}
            width={22}
            height={22}
            className="h-7 w-7 object-contain"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-muted-foreground truncate text-start text-sm font-bold capitalize">
            {categoryName}
          </h3>
          <div className="from-primary/50 to-primary mt-0.5 h-0.5 w-6 rounded-full bg-linear-to-r" />
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-3">
        <div className="text-center">
          <div className="text-foreground mb-1 text-lg font-medium">
            {iRating ? iRating.toLocaleString() : "—"}
          </div>
          <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            iRating
          </div>
        </div>

        <div className="text-center">
          <div className="text-foreground mb-1 text-lg font-medium">
            {safetyRating || "—"}
          </div>
          <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            Safety
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={cn(
              "text-foreground flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold shadow-lg",
              "transition-all duration-200 group-hover:scale-110",
            )}
            style={{ backgroundColor: licenseColor }}
          >
            {licenseClass}
          </div>

          <div className="text-muted-foreground mt-1.5 text-[10px] font-semibold tracking-wider uppercase">
            License
          </div>
        </div>
      </div>
    </div>
  );
}

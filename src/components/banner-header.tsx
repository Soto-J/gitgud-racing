import { cn } from "@/lib/utils";

import { ComponentType } from "react";

interface BannerProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
}

export const BannerHeader = ({
  title,
  description,
  icon: Icon,
  iconColor,
}: BannerProps) => {
  return (
    <div className="from-ferrari-dark-red via-ferrari-red relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r to-red-700 shadow-xl">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      <div className="relative px-8 py-12 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="text-lg tracking-wide text-red-200">{description}</p>
          </div>

          <div className="hidden md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Icon className={cn("h-14 w-14", iconColor)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

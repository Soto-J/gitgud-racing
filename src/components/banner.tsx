import { cn } from "@/lib/utils";
import { Edit3, Shield, Trophy, User } from "lucide-react";
import { ComponentType } from "react";

interface BannerHeaderProps {
  section: string;
  icon?: ComponentType<{ className?: string; size?: number }>;
  title: string;
  subTitle1: string;
  subTitle2: string;
  onEdit?: () => void;
  editText?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    container: "px-6 py-8",
    iconContainer: "h-12 w-12",
    iconSize: 24,
    title: "text-2xl md:text-3xl",
    section: "text-xs",
    subtitle: "text-sm",
    button: "px-4 py-2 text-sm",
    buttonIcon: 16,
    backgroundIcons: { trophy: 64, shield: 48 },
  },
  md: {
    container: "px-8 py-10",
    iconContainer: "h-16 w-16",
    iconSize: 32,
    title: "text-3xl md:text-4xl",
    section: "text-sm",
    subtitle: "text-base",
    button: "px-6 py-3 text-base",
    buttonIcon: 18,
    backgroundIcons: { trophy: 80, shield: 64 },
  },
  lg: {
    container: "px-10 py-12",
    iconContainer: "h-20 w-20",
    iconSize: 40,
    title: "text-4xl md:text-5xl",
    section: "text-base",
    subtitle: "text-lg",
    button: "px-8 py-4 text-lg",
    buttonIcon: 20,
    backgroundIcons: { trophy: 96, shield: 80 },
  },
};

export default function Banner({
  section,
  subTitle1,
  subTitle2,
  icon: CustomIcon,
  title,
  onEdit,
  editText = "Edit Profile",
  size = "md",
}: BannerHeaderProps) {
  const sizeStyles = sizeConfig[size];
  const DisplayIcon = CustomIcon || Trophy;

  return (
    <div className="bg-card mb-8 overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md">
      <div
        className={cn(
          "relative bg-gradient-to-r from-red-600 via-red-700 to-red-800",
          sizeStyles.container,
        )}
      >
        <div className="absolute inset-0">
          <div className="absolute top-4 right-6 rotate-12 transform opacity-10">
            <Trophy
              size={sizeStyles.backgroundIcons.trophy}
              className="text-yellow-400"
            />
          </div>
          <div className="absolute right-20 bottom-4 -rotate-12 transform opacity-8">
            <Shield
              size={sizeStyles.backgroundIcons.shield}
              className="text-yellow-300"
            />
          </div>

          {/* Speed lines effect */}
          <div className="absolute top-1/4 left-0 h-px w-full -skew-y-2 transform bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
          <div className="absolute top-2/3 left-0 h-px w-full -skew-y-2 transform bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />
        </div>

        {/* Ferrari racing overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-yellow-400/5" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Ferrari-themed Icon */}
            <div
              className={cn(
                "hidden items-center justify-center rounded-full bg-yellow-400 p-2.5 shadow-xl ring-4 ring-yellow-300/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-yellow-300 hover:shadow-2xl sm:flex",
              )}
            >
              <DisplayIcon
                className="text-red-700"
                size={sizeStyles.iconSize}
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div className="text-white">
              <div className="mb-2 flex items-center gap-3">
                <h1
                  className={cn(
                    "font-medium tracking-wider text-yellow-200 uppercase",
                    sizeStyles.section,
                  )}
                >
                  {section}
                </h1>
                <div className="h-1 w-8 rounded-full bg-yellow-400 shadow-sm" />
              </div>

              <h2
                className={cn(
                  "mb-4 leading-tight font-bold text-white drop-shadow-lg",
                  sizeStyles.title,
                )}
              >
                {title}
              </h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2 text-yellow-100">
                  <User size={18} aria-hidden="true" />
                  <span className={cn("font-medium", sizeStyles.subtitle)}>
                    {subTitle1}
                  </span>
                </div>

                <div className="hidden h-4 w-px bg-yellow-300/50 sm:block" />

                <div className="flex items-center gap-2 text-yellow-100">
                  <Shield size={18} aria-hidden="true" />
                  <span className={cn("font-medium", sizeStyles.subtitle)}>
                    {subTitle2}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ferrari-themed Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className={cn(
                "group relative flex transform items-center justify-center gap-2 overflow-hidden rounded-lg border border-yellow-300 bg-yellow-400/90 font-semibold text-red-800 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-yellow-300 hover:shadow-xl focus:ring-2 focus:ring-yellow-400/50 focus:outline-none active:scale-95",
                sizeStyles.button,
              )}
              aria-label={editText}
            >
              <Edit3
                size={sizeStyles.buttonIcon}
                className="transition-transform duration-300 group-hover:rotate-12"
              />
              <span className="whitespace-nowrap">{editText}</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

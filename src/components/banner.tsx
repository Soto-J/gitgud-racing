import { cn } from "@/lib/utils";
import { Edit3, Shield, Trophy, User } from "lucide-react";
import { ComponentType } from "react";

interface BannerHeaderProps {
  section: string;
  icon?: ComponentType<{ className?: string; size?: number }>;
  iconColor?: string;
  title: string;
  subTitle1: string;
  subTitle2: string;
  onEdit?: () => void;
  editText?: string;
  theme?: "red" | "blue" | "green" | "purple" | "orange";
  size?: "sm" | "md" | "lg";
}

const themeConfig = {
  red: {
    gradient: "from-red-600 via-red-700 to-red-800",
    iconBg: "from-yellow-400 to-yellow-500",
    iconColor: "text-red-700",
    sectionColor: "text-red-200",
    accent: "bg-yellow-400",
    textColor: "text-red-100",
    divider: "bg-red-300",
  },
  blue: {
    gradient: "from-blue-600 via-blue-700 to-blue-800",
    iconBg: "from-cyan-400 to-cyan-500",
    iconColor: "text-blue-700",
    sectionColor: "text-blue-200",
    accent: "bg-cyan-400",
    textColor: "text-blue-100",
    divider: "bg-blue-300",
  },
  green: {
    gradient: "from-green-600 via-green-700 to-green-800",
    iconBg: "from-lime-400 to-lime-500",
    iconColor: "text-green-700",
    sectionColor: "text-green-200",
    accent: "bg-lime-400",
    textColor: "text-green-100",
    divider: "bg-green-300",
  },
  purple: {
    gradient: "from-purple-600 via-purple-700 to-purple-800",
    iconBg: "from-pink-400 to-pink-500",
    iconColor: "text-purple-700",
    sectionColor: "text-purple-200",
    accent: "bg-pink-400",
    textColor: "text-purple-100",
    divider: "bg-purple-300",
  },
  orange: {
    gradient: "from-orange-600 via-orange-700 to-orange-800",
    iconBg: "from-amber-400 to-amber-500",
    iconColor: "text-orange-700",
    sectionColor: "text-orange-200",
    accent: "bg-amber-400",
    textColor: "text-orange-100",
    divider: "bg-orange-300",
  },
};

const sizeConfig = {
  sm: {
    container: "px-6 py-6",
    iconContainer: "h-16 w-16",
    iconSize: 32,
    title: "text-2xl md:text-3xl",
    section: "text-xs",
    subtitle: "text-sm",
    button: "px-6 py-3 text-base",
    buttonIcon: 18,
    backgroundIcons: { trophy: 80, shield: 60 },
  },
  md: {
    container: "px-8 py-10",
    iconContainer: "h-20 w-20",
    iconSize: 40,
    title: "text-4xl md:text-5xl",
    section: "text-sm",
    subtitle: "text-base",
    button: "px-8 py-4 text-lg",
    buttonIcon: 20,
    backgroundIcons: { trophy: 120, shield: 80 },
  },
  lg: {
    container: "px-10 py-12",
    iconContainer: "h-24 w-24",
    iconSize: 48,
    title: "text-5xl md:text-6xl",
    section: "text-base",
    subtitle: "text-lg",
    button: "px-10 py-5 text-xl",
    buttonIcon: 24,
    backgroundIcons: { trophy: 140, shield: 100 },
  },
};

export const Banner = ({
  section,
  subTitle1,
  subTitle2,
  icon: CustomIcon,
  iconColor,
  title,
  onEdit,
  editText = "Edit Profile",
  theme = "red",
  size = "md",
}: BannerHeaderProps) => {
  const themeStyles = themeConfig[theme];
  const sizeStyles = sizeConfig[size];
  const DisplayIcon = CustomIcon || Trophy;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div
        className={cn(
          "relative bg-gradient-to-r",
          themeStyles.gradient,
          sizeStyles.container,
        )}
      >
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 rotate-12 transform animate-pulse">
            <Trophy
              size={sizeStyles.backgroundIcons.trophy}
              className="text-yellow-300"
            />
          </div>
          <div className="absolute right-32 bottom-8 -rotate-12 transform animate-pulse delay-1000">
            <Shield
              size={sizeStyles.backgroundIcons.shield}
              className="text-white"
            />
          </div>
          {/* Additional decorative elements */}
          <div className="absolute top-1/2 left-20 rotate-45 transform opacity-5">
            <User size={60} className="text-white" />
          </div>
        </div>

        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Dynamic Icon - Hidden on mobile */}
            <div
              className={cn(
                `hidden items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-4 ring-white/20 transition-transform duration-300 hover:scale-110 sm:flex`,
                sizeStyles.iconContainer,
                themeStyles.iconBg,
              )}
            >
              <DisplayIcon
                className={iconColor || themeStyles.iconColor}
                size={sizeStyles.iconSize}
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div className="text-white">
              <div className="mb-2 flex items-center gap-3">
                <h1
                  className={cn(
                    "font-medium tracking-wider",
                    themeStyles.sectionColor,
                    sizeStyles.section,
                  )}
                >
                  {section}
                </h1>
                <div
                  className={cn(
                    "h-1 w-8 rounded-full shadow-sm",
                    themeStyles.accent,
                  )}
                />
              </div>

              <h2
                className={cn("mb-3 leading-tight font-bold", sizeStyles.title)}
              >
                {title}
              </h2>

              <div
                className={cn(
                  "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4",
                  themeStyles.textColor,
                )}
              >
                <div className="flex items-center gap-2">
                  <User size={18} aria-hidden="true" />
                  <span className={cn("font-medium", sizeStyles.subtitle)}>
                    {subTitle1}
                  </span>
                </div>

                <div
                  className={cn(
                    "hidden h-4 w-px sm:block",
                    themeStyles.divider,
                  )}
                ></div>

                <div className="flex items-center gap-2">
                  <Shield size={18} aria-hidden="true" />
                  <span className={`font-medium ${sizeStyles.subtitle}`}>
                    {subTitle2}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className={cn(
                "group relative flex transform items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/30 bg-white/10 font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none active:scale-95",
                sizeStyles.button,
              )}
              aria-label={editText}
            >
              <Edit3
                size={sizeStyles.buttonIcon}
                className="transition-transform duration-300 group-hover:rotate-12"
              />
              <span className="whitespace-nowrap">{editText}</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

import { cn } from "@/lib/utils";

interface ProfileFieldProps {
  label: string;
  value: string;
  icon: LucideIcon | IconType | ComponentType<{ className?: string }>;
  iconBgColor: string;
}

export default function ProfileField({
  icon: Icon,
  label,
  value,
  iconBgColor = "bg-muted",
}: ProfileFieldProps) {
  return (
    <div className="border-border bg-muted/50 hover:border-primary/30 hover:bg-muted group relative overflow-hidden rounded-xl border p-5 transition-all duration-300">
      {/* Hover accent line */}
      <div className="from-primary to-secondary absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full" />

      <div className="flex items-center gap-4">
        <div
          className={cn(
            "text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110",
            iconBgColor,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">
            {label}
          </div>
          <div className="text-card-foreground truncate text-base font-medium">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

import { LucideIcon } from "lucide-react";
0
import { cn } from "@/lib/utils";

interface ProfileFieldProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBgColor: string;
}

export default function ProfileField({
  icon: Icon,
  label,
  value,
  iconBgColor = "bg-gray-600",
}: ProfileFieldProps) {
  return (
    <div className="group border-border p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "text-foreground rounded-xl p-3 shadow-lg",
            iconBgColor,
          )}
        >
          <Icon size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground mb-1 font-medium tracking-wide uppercase">
            {label}
          </div>

          <div className="text-foreground rounded-lg p-3 text-lg font-semibold break-words">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { licenseGroupTypeMap } from "@/modules/iracing-schedule/constants";

interface LicenseFilterProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const LICENSE_ENTRIES = Object.entries(licenseGroupTypeMap).map(
  ([id, label]) => ({
    id: Number(id),
    label,
  }),
);

export default function LicenseFilter({ value, onChange }: LicenseFilterProps) {
  function toggle(id: number) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  }

  return (
    <div className="bg-muted text-muted-foreground flex items-center rounded-lg p-[3px]">
      {LICENSE_ENTRIES.map(({ id, label }) => {
        const active = value.includes(id);
        return (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={cn(
              "h-[calc(100%-1px)] rounded px-2 py-1 font-mono text-sm font-medium transition-[color,box-shadow]",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}

      {value.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-muted-foreground hover:text-foreground ml-1 transition-colors"
          aria-label="Clear license filter"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

import { format } from "date-fns";
import type { DayButtonProps } from "react-day-picker";

import { Edit } from "lucide-react";

import type { LeagueScheduleGetMany } from "@/modules/league-schedule/server/procedures/get-many/types";

import { CalendarDayButton } from "@/components/ui/calendar";

interface CustomDayButtonProps extends DayButtonProps {
  schedulesByDate: Map<string, LeagueScheduleGetMany>;
}

export const DayButton = ({
  children,
  modifiers,
  day,
  schedulesByDate,
  ...props
}: CustomDayButtonProps) => {
  const dateKey = format(day.date, "yyyy-MM-dd");
  const daySchedules = schedulesByDate.get(dateKey) ?? [];

  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      {...props}
      className="text-secondary border-border items-start justify-start border p-2 [&>span]:text-base"
    >
      <div className="w-full leading-none">
        <div className="flex justify-between">
          {children}
          {!modifiers.outside && !!daySchedules.length && (
            <Edit className="text-muted-foreground size-3.5" />
          )}
        </div>
      </div>

      {!modifiers.outside && !!daySchedules.length && (
        <span className="flex items-center gap-0.5">
          {Array.from({
            length: Math.min(daySchedules.length, 3),
          }).map((_, i) => (
            <span key={i} className="bg-primary size-1.5 rounded-full" />
          ))}
        </span>
      )}
    </CalendarDayButton>
  );
};

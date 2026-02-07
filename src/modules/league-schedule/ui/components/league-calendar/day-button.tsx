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
      {...props}
      day={day}
      modifiers={modifiers}
      className="text-secondary border-border items-start justify-start border p-2 [&>span]:text-base"
    >
      <div className="w-full leading-none">
        <div className="flex justify-between">{children}</div>
      </div>

      {!modifiers.outside && !!daySchedules.length && (
        <div className="mt-1 flex w-full flex-col gap-0.5">
          {daySchedules.slice(0, 2).map((schedule) => (
            <div
              key={schedule.id}
              className="bg-primary/10 text-foreground truncate rounded px-1 text-left text-[10px] leading-tight"
            >
              {schedule.trackName}
            </div>
          ))}
          {daySchedules.length > 2 && (
            <span className="text-muted-foreground text-[10px] leading-tight">
              +{daySchedules.length - 2} more
            </span>
          )}
        </div>
      )}
    </CalendarDayButton>
  );
};

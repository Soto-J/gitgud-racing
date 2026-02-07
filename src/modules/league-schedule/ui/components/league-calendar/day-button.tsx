import { Activity } from "react";
import { format } from "date-fns";

import type { DayButtonProps } from "react-day-picker";
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

  const showMetaData = !modifiers.outside && !!daySchedules.length;

  return (
    <CalendarDayButton
      {...props}
      day={day}
      modifiers={modifiers}
      className="border-border items-start justify-start border p-2 [&>span]:text-base"
    >
      <div className="text-secondary text-lg">{children}</div>

      <Activity mode={showMetaData ? "visible" : "hidden"}>
        <div className="mt-1 min-h-0 w-full min-w-0 overflow-hidden">
          {daySchedules.slice(0, 2).map((schedule) => (
            <div
              key={schedule.id}
              className="bg-primary/10 text-foreground truncate rounded text-left leading-tight md:text-base"
            >
              {schedule.trackName}
            </div>
          ))}

          <Activity mode={daySchedules.length > 2 ? "visible" : "hidden"}>
            <span className="text-muted-foreground text-[10px] leading-tight">
              +{daySchedules.length - 2} more
            </span>
          </Activity>
        </div>
      </Activity>
    </CalendarDayButton>
  );
};

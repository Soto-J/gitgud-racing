"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import type { LeagueSchedule } from "@/modules/league-schedule/server/procedures/get-one/types";

import { RaceDetailDialog } from "../components/dialogs/race-detail-dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";

export default function LeagueScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const trpc = useTRPC();
  const [{ data: schedules }] = useSuspenseQueries({
    queries: [trpc.leagueSchedule.getLeagueSchedules.queryOptions()],
  });

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, LeagueSchedule[]>();

    for (const schedule of schedules) {
      const dateKey = format(new Date(schedule.date), "yyyy-MM-dd");
      const existing = map.get(dateKey) ?? [];

      existing.push(schedule);
      map.set(dateKey, existing);
    }

    return map;
  }, [schedules]);

  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return schedulesByDate.get(dateKey) ?? [];
  }, [selectedDate, schedulesByDate]);

  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDate(day);

    if (day) {
      const dateKey = format(day, "yyyy-MM-dd");
      if (schedulesByDate.has(dateKey)) {
        setIsDetailOpen(true);
      }
    }
  };

  return (
    <>
      <RaceDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        schedules={selectedDateSchedules}
        selectedDate={selectedDate}
      />

      <Card className="mx-auto w-fit p-0">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            numberOfMonths={1}
            captionLayout="dropdown"
            className="overflow-hidden [--cell-size:--spacing(45)] md:[--cell-size:--spacing(48)]"
            classNames={{
              nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between h-8",
              button_previous:
                "size-8 aria-disabled:opacity-50 select-none hover:bg-accent hover:text-accent-foreground",
              button_next:
                "size-8 aria-disabled:opacity-50 p-16 select-none hover:bg-accent hover:text-accent-foreground",
              weekday:
                "justify-between w-full font-semibold text-xl text-primary/70 tracking-wide pb-4",
            }}
            formatters={{
              formatMonthDropdown: (date) => {
                return date.toLocaleString("default", { month: "long" });
              },
              formatWeekdayName: (date) => {
                return date.toLocaleString("default", { weekday: "long" });
              },
            }}
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const dateKey = format(day.date, "yyyy-MM-dd");
                const daySchedules = schedulesByDate.get(dateKey) ?? [];

                return (
                  <CalendarDayButton
                    day={day}
                    modifiers={modifiers}
                    {...props}
                    className="text-secondary items-start justify-start p-6 [&>span]:text-base"
                  >
                    <span className="leading-none">{children}</span>
                    {!modifiers.outside && daySchedules.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        {Array.from({
                          length: Math.min(daySchedules.length, 3),
                        }).map((_, i) => (
                          <span key={i} className="size-1.5 rounded-full" />
                        ))}
                      </span>
                    )}
                  </CalendarDayButton>
                );
              },
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}

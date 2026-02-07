"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

import type { LeagueScheduleGetMany } from "@/modules/league-schedule/server/procedures/get-many/types";

import { DayButton } from "./day-button";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { WeekDay } from "./weekday";

interface LeagueCalendarProps {
  schedules: LeagueScheduleGetMany;
  onSelectDate: (date: Date | undefined) => void;
}

export const LeagueCalendar = ({
  schedules,
  onSelectDate,
}: LeagueCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, LeagueScheduleGetMany>();

    for (const schedule of schedules) {
      const dateKey = format(new Date(schedule.date), "yyyy-MM-dd");
      const existing = map.get(dateKey) ?? [];

      existing.push(schedule);
      map.set(dateKey, existing);
    }

    return map;
  }, [schedules]);

  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDate(day);
    onSelectDate(day);
  };

  return (
    <Card className="w-full p-0 border-primary shadow">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          numberOfMonths={1}
          captionLayout="dropdown"
          className="w-full overflow-hidden [--cell-size:--spacing(26)] md:[--cell-size:--spacing(30)]"
          classNames={{}}
          formatters={{
            formatMonthDropdown: (date) => {
              return date.toLocaleString("default", { month: "long" });
            },
            formatWeekdayName: (date) => {
              return date.toLocaleString("default", { weekday: "long" });
            },
          }}
          components={{
            Weekday: (props) => <WeekDay {...props} />,
            DayButton: (props) => (
              <DayButton {...props} schedulesByDate={schedulesByDate} />
            ),
          }}
        />
      </CardContent>
    </Card>
  );
};

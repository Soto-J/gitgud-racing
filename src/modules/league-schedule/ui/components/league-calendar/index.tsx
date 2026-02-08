"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { Plus } from "lucide-react";
import type { LeagueScheduleGetMany } from "@/modules/league-schedule/server/procedures/get-many/types";

import { DayButton } from "./day-button";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

import { WeekDay } from "./weekday";
import { Button } from "@/components/ui/button";
interface LeagueCalendarProps {
  schedules: LeagueScheduleGetMany;
  onSelectDate: (date: Date | undefined) => void;
  onOpenEditDialog: () => void;
}

export const LeagueCalendar = ({
  schedules,
  onSelectDate,
  onOpenEditDialog,
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
    <Card className="border-primary mx-auto w-fit overflow-hidden p-0 shadow">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          numberOfMonths={1}
          captionLayout="dropdown"
          className={cn(
            "[--cell-size:--spacing(11)] sm:[--cell-size:--spacing(15)] md:[--cell-size:--spacing(20)] lg:[--cell-size:--spacing(25)] xl:[--cell-size:--spacing(30)] 2xl:[--cell-size:--spacing(50)]",
            "rounded-lg",
          )}
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
            MonthCaption({ children, className, ...props }) {
              return (
                <div className={cn(className, "")}>
                  <div className="flex gap-x-2">
                    {children}
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative z-20 cursor-pointer"
                      onClick={onOpenEditDialog}
                    >
                      <Plus className="size-4" />
                      New
                    </Button>
                  </div>
                </div>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

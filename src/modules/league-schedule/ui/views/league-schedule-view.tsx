"use client";

import { Card, CardContent } from "@/components/ui/card";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";

import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import UnderConstruction from "@/components/under-construction";
import { useState } from "react";

interface SchedulePageViewProps {}

export default function ScheduleView({}: SchedulePageViewProps) {
  if (process.env.NODE_ENV !== "development") {
    return (
      <UnderConstruction
        title="Schedule view"
        message="Working on an amazing page for you!"
      />
    );
  }

  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 11, 8),
    to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
  });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const trpc = useTRPC();

  return (
    <Card className="mx-auto w-fit p-0">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
          captionLayout="dropdown"
          className="[--cell-size:--spacing(30)] md:[--cell-size:--spacing(32)]"
          formatters={{
            formatMonthDropdown: (date) => {
              return date.toLocaleString("default", { month: "long" });
            },
          }}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const isWeekend =
                day.date.getDay() === 0 || day.date.getDay() === 6;

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {!modifiers.outside && (
                    <span>{isWeekend ? "$120" : "$100"}</span>
                  )}
                </CalendarDayButton>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
}

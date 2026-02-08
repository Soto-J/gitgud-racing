"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { LeagueCalendar } from "../components/league-calendar";
import { RaceDetailDialog } from "../components/dialogs/race-detail-dialog";
import { EditScheduleDialog } from "../components/dialogs/edit-schedule-dialog";
import { LeagueScheduleGetOne } from "../../server/procedures/get-one/types";

export default function LeagueScheduleView() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<LeagueScheduleGetOne | null>(null);

  const trpc = useTRPC();
  const [{ data: schedules }] = useSuspenseQueries({
    queries: [trpc.leagueSchedule.getMany.queryOptions()],
  });

  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return schedules.filter(
      (s) => format(new Date(s.date), "yyyy-MM-dd") === dateKey,
    );
  }, [selectedDate, schedules]);

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);

    if (date) {
      const dateKey = format(date, "yyyy-MM-dd");
      const hasSchedules = schedules.some(
        (s) => format(new Date(s.date), "yyyy-MM-dd") === dateKey,
      );

      if (hasSchedules) {
        setIsDetailOpen(true);
      }
    }
  };

  return (
    <>
      <EditScheduleDialog
        isOpen={isEditDialogOpen}
        onCloseDialog={() => setIsEditDialogOpen(false)}
        initialValues={selectedSchedule}
        mode={selectedSchedule ? "Edit" : "Create"}
      />

      <RaceDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedDate={selectedDate}
        schedules={selectedDateSchedules}
        onEditSchedule={(schedule) => {
          setSelectedSchedule(schedule);
          setIsDetailOpen(false);
          setIsEditDialogOpen(true);
        }}
      />

      <LeagueCalendar
        schedules={schedules}
        onSelectDate={handleSelectDate}
        onOpenEditDialog={() => setIsEditDialogOpen(true)}
      />
    </>
  );
}

import { useState } from "react";

import { toast } from "sonner";

import { Edit3, Trash } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { cn } from "@/lib/utils";

import { useConfirm } from "@/hooks/use-confirm";

import { LeagueScheduleDialog } from "./form/league-schedule-dialog";

import type { LeagueSchedules } from "@/modules/schedule/server/procedures/league-schedule/get-many/types";
import type { LeagueSchedule } from "@/modules/schedule/server/procedures/league-schedule/get-one/types";

import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LeagueScheduleContentProps {
  scheduleList: LeagueSchedules;
  isAdmin: boolean;
}

export const LeagueScheduleContent = ({
  scheduleList,
  isAdmin,
}: LeagueScheduleContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<LeagueSchedule | null>(null);
  const [mode, setMode] = useState<"Create" | "Edit">("Create");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteSchedule = useMutation(
    trpc.schedule.deleteLeagueSchedule.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.schedule.getLeagueSchedules.queryOptions(),
        );

        toast.success("Schedule successfully deleted.");
      },
      onError: () => {
        toast.error("Something went wrong deleting schedule.");
      },
    }),
  );

  const [ConfirmationDialog, confirmDelete] = useConfirm({
    title: "Delete Schedule",
    description: "Are you sure? This action can't be undone.",
  });

  const onDelete = async (scheduleId: string) => {
    const OK = await confirmDelete();
    if (!OK) return;

    deleteSchedule.mutate({ scheduleId });
  };

  const onSubmit = ({
    schedule,
    mode,
  }: {
    schedule?: LeagueSchedule;
    mode: "Create" | "Edit";
  }) => {
    setMode(mode);

    if (schedule && mode === "Edit") {
      setSelectedSchedule(schedule);
    } else {
      setSelectedSchedule(null);
    }

    setIsOpen(true);
  };

  return (
    <>
      <LeagueScheduleDialog
        onOpenDialog={isOpen}
        onCloseDialog={() => setIsOpen(false)}
        initialValues={selectedSchedule}
        mode={mode}
      />
      <ConfirmationDialog />

      <TabsContent value="gitGud">
        <Card className="relative bg-gradient-to-br from-blue-900 via-gray-800 to-blue-900">
          <CardHeader className="relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-red-500/20" />
            <CardTitle className="relative z-10 text-4xl font-bold text-red-500">
              SEASON 1
            </CardTitle>

            <CardDescription className="relative z-10 text-2xl text-blue-400">
              Schedule
            </CardDescription>
          </CardHeader>

          <Button
            className="absolute top-10 right-6 z-99"
            onClick={() => onSubmit({ mode: "Create" })}
          >
            Add Schedule
          </Button>

          <CardContent className="space-y-4">
            {scheduleList.length > 0 ? (
              scheduleList.map((schedule, index) => {
                const raceDate = new Date(schedule.date);
                const month = raceDate
                  .toLocaleDateString("en-US", { month: "short" })
                  .toUpperCase();
                const day = raceDate.getDate();
                const celsius = Math.floor(((schedule.temp - 32) * 5) / 9);

                return (
                  <div
                    key={schedule.id}
                    className="flex flex-col items-stretch overflow-hidden rounded-lg shadow-lg md:flex-row md:gap-4"
                  >
                    <div
                      className={cn(
                        "flex w-full items-center justify-center gap-x-2 py-2 font-bold text-white md:w-45 md:py-0",
                        index >= Math.floor(scheduleList.length / 2)
                          ? "bg-red-600"
                          : "bg-blue-600",
                      )}
                    >
                      <div className="text-lg md:text-xl">{month}</div>
                      <div className="text-lg md:text-xl">{day}</div>
                    </div>

                    <div className={cn("relative flex-1 bg-white shadow-lg")}>
                      <div className="flex flex-col items-start justify-between gap-2 border-b border-gray-300 px-2 text-sm font-semibold tracking-wide uppercase sm:flex-row md:px-4 md:pt-6 md:text-lg">
                        <div className={cn("flex-1 py-2 pb-6 text-center")}>
                          {schedule.trackName}
                        </div>

                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-2 sm:self-start">
                            <Button
                              variant="outline"
                              onClick={() =>
                                onSubmit({ schedule, mode: "Edit" })
                              }
                              className="h-6 w-6"
                            >
                              <Edit3 />
                            </Button>

                            <Button
                              onClick={() => onDelete(schedule.id)}
                              className="h-6 w-6"
                            >
                              <Trash />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-around gap-1 px-2 py-2 font-medium sm:flex-row sm:gap-0 md:px-4 md:text-sm">
                        <div className="text-xs font-normal lg:text-base">
                          {schedule.raceLength} MINUTES
                        </div>

                        <div className="text-xs font-normal lg:text-base">
                          {schedule.temp}°F / {celsius}°C
                        </div>

                        <div className="text-xs font-normal lg:text-base">
                          {raceDate.toLocaleDateString("en-US", {
                            month: "numeric",
                            day: "numeric",
                            year: "2-digit",
                          })}{" "}
                          {raceDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          iX
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-2 text-2xl font-bold text-gray-400">
                  No Races Scheduled
                </div>

                <div className="mb-6 text-gray-500">
                  Season 1 schedule is empty. Start by adding your first race.
                </div>

                {isAdmin && (
                  <Button
                    onClick={() => onSubmit({ mode: "Create" })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add First Race
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

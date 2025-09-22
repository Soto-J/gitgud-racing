import { useState } from "react";

import { cn } from "@/lib/utils";

import { Edit3, Trash } from "lucide-react";

import type { LeagueSchedules } from "@/modules/schedule/server/procedures/league-schedule/get-many/types";

import { EditLeagueScheduleDialog } from "./form/edit-schedule-dialog";
import { LeagueSchedule } from "../../server/procedures/league-schedule/get-one/types";

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
  scheduleList?: LeagueSchedules;
  isAdmin: boolean;
}

// Dummy data for testing
const dummyScheduleList = [
  {
    id: "1",
    seasonNumber: 1,
    trackName: "INDIANAPOLIS MOTOR SPEEDWAY - ROAD COURSE",
    raceLength: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
    temp: 68,
    date: new Date("2024-10-19T21:55:00Z"),
  },
  {
    id: "2",
    seasonNumber: 1,
    trackName: "HOCKENHEIMRING - GRAND PRIX",
    raceLength: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
    temp: 65,
    date: new Date("2024-10-26T16:00:00Z"),
  },
  {
    id: "3",
    seasonNumber: 1,
    trackName: "SEBRING INTERNATIONAL RACEWAY - INTERNATIONAL",
    raceLength: 45,
    temp: 78,
    createdAt: new Date(),
    updatedAt: new Date(),
    date: new Date("2024-11-02T18:10:00Z"),
  },
  {
    id: "4",
    seasonNumber: 1,
    trackName: "AUTODROMO JOSE CARLOS PACE - GRAND PRIX",
    raceLength: 45,
    temp: 67,
    createdAt: new Date(),
    updatedAt: new Date(),
    date: new Date("2024-11-09T21:20:00Z"),
  },
  {
    id: "5",
    seasonNumber: 1,
    trackName: "SUZUKA INTERNATIONAL RACING COURSE - GRAND PRIX",
    raceLength: 45,
    temp: 66,
    date: new Date("2024-11-16T11:20:00Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    seasonNumber: 1,
    trackName: "MOUNT PANORAMA CIRCUIT",
    raceLength: 45,
    temp: 77,
    date: new Date("2024-11-23T16:00:00Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    seasonNumber: 1,
    trackName: "WATKINS GLEN INTERNATIONAL - BOOT",
    raceLength: 45,
    temp: 65,
    date: new Date("2024-11-30T18:30:00Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    seasonNumber: 1,
    trackName: "AUTODROMO MUGELLO - GRAND PRIX",
    raceLength: 60,
    temp: 66,
    date: new Date("2024-12-07T16:00:00Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as LeagueSchedules;

export const LeagueScheduleContent = ({
  scheduleList,
  isAdmin,
}: LeagueScheduleContentProps) => {
  const [selectedSchedule, setSelectedSchedule] =
    useState<LeagueSchedule | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const onEdit = (schedule: LeagueSchedule) => {
    setSelectedSchedule(schedule);
    setIsOpen(true);
  };
  return (
    <>
      <EditLeagueScheduleDialog
        onOpenDialog={isOpen}
        onCloseDialog={() => setIsOpen(false)}
        initialValues={selectedSchedule}
      />

      <TabsContent value="gitGud">
        <Card className="bg-gradient-to-br from-blue-900 via-gray-800 to-blue-900">
          <CardHeader className="relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-red-500/20" />
            <CardTitle className="relative z-10 text-4xl font-bold text-red-500">
              SEASON 1
            </CardTitle>

            <CardDescription className="relative z-10 text-2xl text-blue-400">
              Schedule
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {dummyScheduleList.map((schedule, index) => {
              const raceDate = new Date(schedule.date);
              const month = raceDate
                .toLocaleDateString("en-US", { month: "short" })
                .toUpperCase();
              const day = raceDate.getDate();
              const celsius = Math.floor(((schedule.temp - 32) * 5) / 9);

              return (
                <div key={schedule.id} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-23 w-45 items-center justify-center gap-x-2 font-bold text-white",
                      index >= Math.floor(dummyScheduleList.length / 2)
                        ? "bg-red-600"
                        : "bg-blue-600",
                    )}
                  >
                    <div className="text-xl">{month}</div>
                    <div className="text-xl">{day}</div>
                  </div>

                  <div className="flex-1 border-2 border-gray-300 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3 text-lg font-bold tracking-wide uppercase">
                      <div className="flex-1 text-center">
                        {schedule.trackName}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => onEdit(schedule)}
                            className="h-8 w-8"
                          >
                            <Edit3 />
                          </Button>

                          <Button onClick={() => {}} className="h-8 w-8">
                            <Trash />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-around px-4 py-2 text-sm font-medium">
                      <div>{schedule.raceLength} MINUTES</div>
                      <div>
                        {schedule.temp}°F / {celsius}°C
                      </div>

                      <div>
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
            })}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

import type { LeagueSchedules } from "@/modules/schedule/server/procedures/league-schedule/get-many/types";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditLeagueScheduleDialog } from "./form/edit-schedule-dialog";
import { useState } from "react";
import { LeagueSchedule } from "../../server/procedures/league-schedule/get-one/types";

interface GitGudScheduleProps {
  scheduleList: LeagueSchedules;
}

export const GitGudSchedule = ({ scheduleList }: GitGudScheduleProps) => {
  const [selectedDate, setSelectedDate] = useState<LeagueSchedule | null>(null);
  const mockSchedule = [
    {
      date: "",
      time: "",
      track: "",
      timeLimie: "",
      weather: "",
    },
  ];
  return (
    <>
      <EditLeagueScheduleDialog
        onOpenDialog={false}
        onCloseDialog={function (): void {
          throw new Error("Function not implemented.");
        }}
        initialValues={selectedDate}
      />

      <TabsContent value="gitGud">
        <Card>
          <CardHeader>
            <CardTitle>GitGud</CardTitle>

            <CardDescription>League Schedule</CardDescription>
          </CardHeader>

          <CardContent>
            {scheduleList.map((schedule) => (
              <div></div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

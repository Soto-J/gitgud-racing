import type { LeagueSchedules } from "@/modules/schedule/server/procedures/league-schedule/get-many/types";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GitGudScheduleProps {
  schedule: LeagueSchedules;
}

export const GitGudSchedule = ({ schedule }: GitGudScheduleProps) => {
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
    <TabsContent value="gitGud">
      <Card>
        <CardHeader>
          <CardTitle>GitGud</CardTitle>

          <CardDescription>
            Make changes to your account here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>

        <CardContent></CardContent>
      </Card>
    </TabsContent>
  );
};

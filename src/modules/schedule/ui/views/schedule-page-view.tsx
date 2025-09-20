"use client";

import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IRacingSchedule } from "@/modules/schedule/ui/components/iracing-schedule";
import { GitGudSchedule } from "@/modules/schedule/ui/components/git-gud-schedule";

interface SchedulePageViewProps {
  seasonInfo: {
    currentYear: string;
    currentQuarter: string;
    currentRaceWeek: string;
  };
}
export const SchedulePageView = ({ seasonInfo }: SchedulePageViewProps) => {
  const trpc = useTRPC();
  const [iRacingPayload, leaguePayload] = useSuspenseQueries({
    queries: [
      trpc.schedule.seasonSchedule.queryOptions({
        includeSeries: "true",
        seasonYear: seasonInfo.currentYear,
        seasonQuarter: seasonInfo.currentQuarter,
      }),
      trpc.schedule.getLeagueSchedules.queryOptions(),
    ],
  });
  return (
    <>
      <Tabs defaultValue="gitGud" className="mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gitGud">GitGud Racing</TabsTrigger>
          <TabsTrigger value="iRacing">iRacing Schedule</TabsTrigger>
        </TabsList>

        <GitGudSchedule schedule={leaguePayload.data} />
        <IRacingSchedule schedule={iRacingPayload.data} />
      </Tabs>
    </>
  );
};

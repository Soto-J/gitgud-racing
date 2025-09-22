"use client";

import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IRacingScheduleContent } from "@/modules/schedule/ui/components/iracing-schedule-content";
import { LeagueScheduleContent } from "@/modules/schedule/ui/components/league-schedule-content";

interface SchedulePageViewProps {
  seasonInfo: {
    currentYear: string;
    currentQuarter: string;
    currentRaceWeek: string;
  };
  isAdmin: boolean;
}
export const SchedulePageView = ({
  seasonInfo,
  isAdmin,
}: SchedulePageViewProps) => {
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
        <TabsList className="grid h-14 w-full grid-cols-2">
          <TabsTrigger value="gitGud">League Schedule</TabsTrigger>
          <TabsTrigger value="iRacing">iRacing Schedule</TabsTrigger>
        </TabsList>

        <LeagueScheduleContent
          scheduleList={leaguePayload.data}
          isAdmin={isAdmin}
        />
        <IRacingScheduleContent scheduleList={iRacingPayload.data} />
      </Tabs>
    </>
  );
};

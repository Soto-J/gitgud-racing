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
export default function SchedulePageView({
  seasonInfo,
  isAdmin,
}: SchedulePageViewProps) {
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
        <TabsList className="mb-6 grid w-full grid-cols-2 gap-x-2 rounded-lg border border-white/20 bg-black/80 p-0 backdrop-blur-sm sm:p-2 md:h-16">
          <TabsTrigger
            value="gitGud"
            className="text-accent text-lg transition-all duration-200 hover:bg-white/10 data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            League Schedule
          </TabsTrigger>
          <TabsTrigger
            value="iRacing"
            className="text-accent text-lg transition-all duration-200 hover:bg-white/10 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            iRacing Schedule
          </TabsTrigger>
        </TabsList>

        <LeagueScheduleContent
          scheduleList={leaguePayload.data}
          isAdmin={isAdmin}
        />
        <IRacingScheduleContent scheduleList={iRacingPayload.data} />
      </Tabs>
    </>
  );
}

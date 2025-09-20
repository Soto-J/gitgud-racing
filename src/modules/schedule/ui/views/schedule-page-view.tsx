"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { UnderConstruction } from "@/components/under-construction";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IRacingSchedule } from "../components/iracing-schedule";
import { GitGudSchedule } from "../components/git-gud-schedule";

interface SchedulePageViewProps {
  seasonInfo: {
    currentYear: string;
    currentQuarter: string;
    currentRaceWeek: string;
  };
}
export const SchedulePageView = ({ seasonInfo }: SchedulePageViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.schedule.seasonSchedule.queryOptions({
      includeSeries: "true",
      seasonYear: seasonInfo.currentYear,
      seasonQuarter: seasonInfo.currentQuarter,
    }),
  );
  return (
    <>
      <Tabs defaultValue="gitGud" className="mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gitGud">GitGud Racing</TabsTrigger>
          <TabsTrigger value="iRacing">iRacing Schedule</TabsTrigger>
        </TabsList>

        <GitGudSchedule />
        <IRacingSchedule schedule={data} />
      </Tabs>

      <UnderConstruction
        title="Race Schedule"
        message="The racing schedule is being prepared. Check back soon for upcoming races!"
      />
    </>
  );
};

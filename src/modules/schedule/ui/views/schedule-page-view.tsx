"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { UnderConstruction } from "@/components/under-construction";

interface SchedulePageViewProps {
  seasonInfo: {
    currentYear: string;
    currentQuarter: string;
    currentRaceWeek: string;
  };
}
export const SchedulePageView = ({ seasonInfo }: SchedulePageViewProps) => {
  console.log({ seasonInfo });
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.schedule.seasonSchedule.queryOptions({
      includeSeries: "true",
      seasonYear: seasonInfo.currentYear,
      seasonQuarter: seasonInfo.currentQuarter,
    }),
  );
  // console.log({ data });
  return (
    <UnderConstruction
      title="Race Schedule"
      message="The racing schedule is being prepared. Check back soon for upcoming races!"
    />
  );
};

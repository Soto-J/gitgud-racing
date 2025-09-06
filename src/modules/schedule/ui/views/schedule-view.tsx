"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const ScheduleView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.iracing.getAllSeries.queryOptions());
  console.log("data", data);

  if (!data) {
    return <div>No Data</div>
  }
  return <div>ScheduleView</div>;
};

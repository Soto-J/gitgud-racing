"use client";

import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import UnderConstruction from "@/components/under-construction";

interface SchedulePageViewProps {}

export default function ScheduleView({}: SchedulePageViewProps) {
  if (process.env.NODE_ENV !== "development") {
    return (
      <UnderConstruction
        title="Schedule view"
        message="Working on an amazing page for you!"
      />
    );
  }

  const trpc = useTRPC();

  return (
    <>
      <div></div>
    </>
  );
}

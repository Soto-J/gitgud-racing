"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { categoryMap } from "@/modules/iracing-schedule/constants";

import SearchInput from "@/components/search-input";
import ScheduleGrid from "@/modules/iracing-schedule/ui/components/schedule-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SCHEDULE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "1", label: categoryMap[1] }, // Oval
  { id: "4", label: categoryMap[4] }, // Dirt Road
  { id: "3", label: categoryMap[3] }, // Dirt Oval
  { id: "5", label: categoryMap[5] }, // Sport
  { id: "6", label: categoryMap[6] }, // Formula
] as const;

export default function IracingScheduleView() {
  const [search, setSearch] = useState("");

  const trpc = useTRPC();
  const { data: seasons } = useSuspenseQuery(
    trpc.iracingSchedule.getMany.queryOptions(),
  );

  const searchFiltered = search
    ? seasons.filter((s) =>
        s.season_name.toLowerCase().includes(search.toLowerCase()),
      )
    : seasons;

  return (
    <Tabs defaultValue="all" className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <TabsList>
          {SCHEDULE_CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search series..."
        />
      </div>

      {SCHEDULE_CATEGORIES.map((category) => {
        const filtered =
          category.id === "all"
            ? searchFiltered
            : searchFiltered.filter(
                (s) => s.current_week_sched.category_id === Number(category.id),
              );

        return (
          <TabsContent key={category.id} value={category.id}>
            <ScheduleGrid seasons={filtered} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

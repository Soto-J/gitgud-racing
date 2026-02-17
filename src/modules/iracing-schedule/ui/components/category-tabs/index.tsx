import { categoryMap } from "@/modules/iracing-schedule/constants";
import type { Season } from "@/modules/iracing-schedule/types";

import ScheduleGrid from "@/modules/iracing-schedule/ui/components/schedule-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SCHEDULE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "2", label: categoryMap[2] }, // Road
  { id: "1", label: categoryMap[1] }, // Oval
  { id: "4", label: categoryMap[4] }, // Dirt Road
  { id: "3", label: categoryMap[3] }, // Dirt Oval
  { id: "5", label: categoryMap[5] }, // Sport
  { id: "6", label: categoryMap[6] }, // Formula
] as const;

interface CategoryTabsProps {
  seasons: Season[];
}

export function CategoryTabs({ seasons }: CategoryTabsProps) {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        {SCHEDULE_CATEGORIES.map((category) => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {SCHEDULE_CATEGORIES.map((category) => {
        const filtered =
          category.id === "all"
            ? seasons
            : seasons.filter(
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

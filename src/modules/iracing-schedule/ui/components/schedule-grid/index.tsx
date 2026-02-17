import type { Season } from "@/modules/iracing-schedule/types";
import { ScheduleCard } from "../schedule-card";

interface ScheduleGridProps {
  seasons: Season[];
}

export default function ScheduleGrid({ seasons }: ScheduleGridProps) {
  if (seasons.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        No series found for this category.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {seasons.map((season) => (
        <ScheduleCard key={season.season_id} season={season} />
      ))}
    </div>
  );
}

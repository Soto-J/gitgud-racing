import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { categoryMap } from "@/modules/iracing-schedule/constants";
import type { Season } from "@/modules/iracing-schedule/types";
import { MapPin, Settings, Users, Wrench } from "lucide-react";

interface ScheduleCardProps {
  season: Season;
}

export function ScheduleCard({ season }: ScheduleCardProps) {
  const { current_week_sched } = season;
  const categoryLabel =
    categoryMap[current_week_sched.category_id as keyof typeof categoryMap];

  return (
    <Card className="hover:border-primary/30 cursor-pointer transition-colors">
      <CardHeader>
        <CardDescription className="flex items-center justify-between">
          <span>{categoryLabel}</span>
          <span className="text-xs">
            Week {current_week_sched.race_week_num + 1} of {season.max_weeks}
          </span>
        </CardDescription>
        <CardTitle className="text-sm">{season.season_name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="text-primary size-4 shrink-0" />
          <span className="truncate">
            {current_week_sched.track.track_name}
          </span>
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1">
            <Wrench className="size-3" />
            {season.fixed_setup ? "Fixed" : "Open"}
          </span>
          <span className="flex items-center gap-1">
            <Settings className="size-3" />
            {season.official ? "Official" : "Unofficial"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {season.reg_user_count.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

import { MapPin, Settings, Users, Wrench } from "lucide-react";

import type { Season } from "@/modules/iracing-schedule/types";

import {
  categoryMap,
  licenseGroupTypeMap,
} from "@/modules/iracing-schedule/constants";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      {seasons.map((season) => {
        const { current_week_sched } = season;
        const categoryLabel =
          categoryMap[
            current_week_sched.category_id as keyof typeof categoryMap
          ];

        return (
          <Card
            key={season.season_id}
            className="hover:border-primary/30 cursor-pointer transition-colors"
          >
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {categoryLabel}
                  {season.license_group_types.map(({ license_group_type }) => (
                    <span
                      key={license_group_type}
                      className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {licenseGroupTypeMap[
                        license_group_type as keyof typeof licenseGroupTypeMap
                      ] ?? license_group_type}
                    </span>
                  ))}
                </span>

                <span className="text-xs">
                  Week {current_week_sched.race_week_num + 1} of{" "}
                  {season.max_weeks}
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
      })}
    </div>
  );
}

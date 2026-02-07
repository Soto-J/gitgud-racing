import { format } from "date-fns";

import type { LeagueScheduleGetMany } from "@/modules/league-schedule/server/procedures/get-many/types";

import { Edit3 } from "lucide-react";

import ResponsiveDialog from "@/components/responsive-dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface RaceDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schedules: LeagueScheduleGetMany;
  selectedDate: Date | undefined;
  onEditSchedule: (schedule: LeagueScheduleGetMany[number]) => void;
}

export function RaceDetailDialog({
  isOpen,
  onOpenChange,
  schedules,
  selectedDate,
  onEditSchedule,
}: RaceDetailDialogProps) {
  const title = selectedDate
    ? format(selectedDate, "EEEE, MMMM d, yyyy")
    : "Race Details";

  const description =
    schedules.length === 1
      ? "1 race scheduled"
      : `${schedules.length} races scheduled`;

  return (
    <ResponsiveDialog
      title={title}
      description={description}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-4">
        {schedules.map((schedule) => {
          const raceDate = new Date(schedule.date);
          const celsius = Math.floor(((schedule.temp - 32) * 5) / 9);

          return (
            <div key={schedule.id} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  {schedule.trackName}
                </h3>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditSchedule(schedule)}
                >
                  <Edit3 className="size-4" />
                </Button>
              </div>

              <Separator className="my-3" />

              <div className="text-muted-foreground grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <span className="text-foreground font-medium">Season</span>
                  <p>{schedule.seasonNumber}</p>
                </div>

                <div>
                  <span className="text-foreground font-medium">
                    Race Length
                  </span>
                  <p>{schedule.raceLength} minutes</p>
                </div>

                <div>
                  <span className="text-foreground font-medium">
                    Temperature
                  </span>
                  <p>
                    {schedule.temp}°F / {celsius}°C
                  </p>
                </div>

                <div>
                  <span className="text-foreground font-medium">Car</span>
                  <p>{schedule.car}</p>
                </div>

                <div>
                  <span className="text-foreground font-medium">Setup</span>
                  <p>{schedule.setupType}</p>
                </div>

                <div>
                  <span className="text-foreground font-medium">Start</span>
                  <p>{schedule.startType}</p>
                </div>

                <div>
                  <span className="text-foreground font-medium">
                    Car Damage
                  </span>
                  <p>{schedule.carDamage ? "On" : "Off"}</p>
                </div>

                <div>
                  <span className="text-foreground font-medium">DQ Limit</span>
                  <p>{schedule.disqualification} incidents</p>
                </div>
              </div>

              <div className="text-muted-foreground mt-3 text-sm">
                <span className="text-foreground font-medium">Race Time: </span>
                {raceDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ResponsiveDialog>
  );
}

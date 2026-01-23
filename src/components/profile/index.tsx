import { cn } from "@/lib/utils";

import type { UserChartData } from "@/modules/iracing/server/procedures/chart-data/types";
import type { ProfileGetOne } from "@/modules/profile/types";
import type { UserLicenses } from "@/modules/iracing/server/procedures/user-licenses/types";

import PersonalInfoTab from "./personal-info-tab/contact-info";
import IracingInfoTab from "./iracing-info-tab";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, User } from "lucide-react";

interface ProfileProps {
  chartDataPoints: UserChartData;
  profile: ProfileGetOne;
  iracingPayload: UserLicenses;
}

export default function Profile({
  profile,
  iracingPayload,
  chartDataPoints,
}: ProfileProps) {
  return (
    <Tabs defaultValue="iRacing">
      <TabsList className="border-border bg-muted/30 mb-6 grid w-full grid-cols-2 gap-x-2 rounded-xl border backdrop-blur-sm md:h-16 dark:sm:p-2">
        <TabsTrigger
          value="iRacing"
          className={cn(
            "hover:bg-muted/70 text-lg font-semibold transition-all duration-200",
            "dark:data-[state=active]:bg-primary dark:text-secondary dark:data-[state=active]:text-foreground",
          )}
        >
          iRacing Information
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className={cn(
            "hover:bg-muted/70 text-lg font-semibold transition-all duration-200",
            "dark:data-[state=active]:bg-secondary dark:data-[state=active]:text-secondary-foreground dark:text-primary",
          )}
        >
          Personal Information
        </TabsTrigger>
      </TabsList>

      <TabsList className="border-border bg-muted/30 mb-6 grid w-full grid-cols-2 gap-2 rounded-xl border backdrop-blur-sm md:h-16 dark:p-1">
        <TabsTrigger
          value="iRacing"
          className={
            cn()
            // "rounded-lg text-base font-semibold transition-all duration-200 md:text-lg",
            // "hover:bg-background/60",
            // "dark:data-[state=active]:bg-background dark:data-[state=active]:shadow-sm",
            // "dark:data-[state=inactive]:text-muted-foreground",
          }
        >
          iRacing Information
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className={cn(
            "rounded-lg text-base font-semibold transition-all duration-200 md:text-lg",
            "hover:bg-background/60",
            "dark:data-[state=active]:bg-background dark:data-[state=active]:shadow-sm",
            "dark:data-[state=inactive]:text-muted-foreground",
          )}
        >
          Personal Information
        </TabsTrigger>
      </TabsList>

      <IracingInfoTab
        iracingPayload={iracingPayload}
        chartDataPoints={chartDataPoints}
      />

      <PersonalInfoTab profile={profile} />
    </Tabs>
  );
}

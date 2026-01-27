import { cn } from "@/lib/utils";

import type { UserChartData } from "@/modules/iracing/server/procedures/chart-data/types";
import type { ProfileGetOne } from "@/modules/profile/types";
import type { UserLicenses } from "@/modules/iracing/server/procedures/user-licenses/types";

import ProfileInfoTab from "./profile-info-tab";
import IracingInfoTab from "./iracing-info-tab";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const iRacingTab = "iRacing";
const profileTab = "Profile";

const baseClassName =
  "hover:bg-muted/70 rounded text-lg font-semibold transition-all duration-200";
const baseDarkMode =
  "dark:data-[state=active]:border-muted/40 dark:data-[state=active]:border-3";

const tabTriggers = [
  {
    value: iRacingTab,
    darkMode:
      "dark:data-[state=active]:bg-primary dark:text-secondary dark:data-[state=active]:text-foreground",
  },
  {
    value: profileTab,
    darkMode:
      "dark:data-[state=active]:bg-secondary dark:data-[state=active]:text-secondary-foreground dark:text-primary",
  },
];

interface ProfileProps {
  profilePayload: ProfileGetOne;
  iracingPayload: UserLicenses;
  chartDataPoints: UserChartData;
}

export default function Profile({
  profilePayload,
  iracingPayload,
  chartDataPoints,
}: ProfileProps) {
  return (
    <Tabs defaultValue={profileTab}>
      <TabsList
        className={cn(
          "border-border bg-muted/70 mb-6 grid w-full grid-cols-2 gap-x-2 rounded-xl border backdrop-blur-sm md:h-16",
          "dark:sm:p-2",
        )}
      >
        {tabTriggers.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(tab.darkMode, baseClassName, baseDarkMode)}
          >
            {tab.value} Information
          </TabsTrigger>
        ))}
      </TabsList>

      <IracingInfoTab
        tabKey={iRacingTab}
        iracingPayload={iracingPayload}
        chartDataPoints={chartDataPoints}
      />

      <ProfileInfoTab tabKey={profileTab} profilePayload={profilePayload} />
    </Tabs>
  );
}

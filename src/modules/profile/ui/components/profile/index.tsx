import { cn } from "@/lib/utils";

import type { ProfileGetOneWithIracing } from "@/modules/profile/server/procedures/get-one-with-iracing/types";

import ProfileInfoTab from "./profile-info-tab";
import IracingInfoTab from "./iracing-info-tab";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const iRacingTab = "iRacing";
const profileTab = "Profile";

const baseClassName =
  "hover:bg-muted/70 rounded-lg text-lg font-semibold transition-all duration-200";
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
  data: ProfileGetOneWithIracing;
}

export default function Profile({ data }: ProfileProps) {
  return (
    <Tabs defaultValue={iRacingTab}>
      <TabsList
        className={cn(
          "border-border bg-card mx-auto mb-6 grid w-7xl grid-cols-2 gap-x-2 rounded-xl border backdrop-blur-sm md:h-16",
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
        LicensePayload={data.iracing.licenses}
        chartDataPoints={data.chartData}
      />

      <ProfileInfoTab tabKey={profileTab} profilePayload={data.profile} />
    </Tabs>
  );
}

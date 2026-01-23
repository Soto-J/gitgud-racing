import type { UserChartData } from "@/modules/iracing/server/procedures/chart-data/types";
import type { ProfileGetOne } from "@/modules/profile/types";
import type { UserLicenses } from "@/modules/iracing/server/procedures/user-licenses/types";

import PersonalInfoTab from "./personal-info-tab/contact-info";
import IracingInfoTab from "./iracing-info-tab";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <TabsList className="mb-6 grid w-full grid-cols-2 gap-x-2 rounded-lg border border-white/20 bg-black/80 p-0 backdrop-blur-sm sm:p-2 md:h-16">
        <TabsTrigger
          value="iRacing"
          className="text-accent text-lg transition-all duration-200 hover:bg-white/10 data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          iRacing Information
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className="text-accent text-lg transition-all duration-200 hover:bg-white/10 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
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

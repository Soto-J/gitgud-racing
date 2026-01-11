import type { UserData } from "@/modules/iracing/server/procedures/get-user/types";
import type { UserChartData } from "@/modules/iracing/server/procedures/user-chart-data/schema";

import IracingInfo from "@/components/profile/iracing-info";
import ContactInfo from "./contact-info";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileProps {
  iRacingInfo: UserChartData | null;
  contactInfo: UserData;
}

export default function Profile({ iRacingInfo, contactInfo }: ProfileProps) {
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

      <IracingInfo user={contactInfo} chartData={iRacingInfo} />
      <ContactInfo user={contactInfo} />
    </Tabs>
  );
}

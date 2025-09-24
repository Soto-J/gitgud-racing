import type { UserData } from "@/modules/iracing/server/procedures/get-user/types";
import type { UserChartData } from "@/modules/iracing/server/procedures/user-chart-data/schema";

import { IracingInfo } from "@/components/profile-card/iracing-info";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactInfo } from "./contact-info";

interface ProfileProps {
  iRacingInfo: UserChartData | null;
  contactInfo: UserData;
}

export const Profile = ({ iRacingInfo, contactInfo }: ProfileProps) => {
  return (
    <Tabs defaultValue="iRacing">
      <TabsList className="mb-6 grid w-full grid-cols-2">
        <TabsTrigger
          value="iRacing"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          iRacing Information
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Personal Information
        </TabsTrigger>
      </TabsList>

      <IracingInfo user={contactInfo} chartData={iRacingInfo} />
      <ContactInfo user={contactInfo} />
    </Tabs>
  );
};

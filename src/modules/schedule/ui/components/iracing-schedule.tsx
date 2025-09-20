import { TabsContent } from "@/components/ui/tabs";

import { SeasonSchedule } from "@/modules/schedule/server/procedures/season-schedule/types";

interface IRacingScheduleProps {
  schedule: SeasonSchedule;
}
export const IRacingSchedule = ({ schedule }: IRacingScheduleProps) => {
  return <TabsContent value="iRacing">IRacingSchedule</TabsContent>;
};

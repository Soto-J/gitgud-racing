import { TabsContent } from "@/components/ui/tabs";

import type { SeasonSchedule } from "@/modules/schedule/server/procedures/season-schedule/types";

interface IRacingScheduleContentProps {
  scheduleList: SeasonSchedule;
}
export const IRacingScheduleContent = ({
  scheduleList,
}: IRacingScheduleContentProps) => {
  return <TabsContent value="iRacing">IRacingSchedule</TabsContent>;
};

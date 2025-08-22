import { ScheduleView } from "@/modules/schedule/ui/views/schedule-view";
import * as helper from "@/modules/iracing/server/helper";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const SchedulePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  // await helper.cacheSeriesImage2();
  return <ScheduleView />;
};

export default SchedulePage;

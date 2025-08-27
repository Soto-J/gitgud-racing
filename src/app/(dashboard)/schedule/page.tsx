import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { DateTime } from "luxon";

import { ScheduleView } from "@/modules/schedule/ui/views/schedule-view";
import { auth } from "@/lib/auth";

const SchedulePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const dt = DateTime.now().setZone("America/New_York");
  const resetDay = dt
    .set({
      weekday: 1,
      hour: 20,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .plus({
      day: 7,
    });

  console.log("Date:", dt.day);
  console.log("Reset Day:", resetDay.day);

  return <ScheduleView />;
};

export default SchedulePage;

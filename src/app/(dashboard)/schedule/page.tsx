import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { DateTime } from "luxon";

import { SchedulePageView } from "@/modules/schedule/ui/views/schedule-page-view";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";

const SchedulePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const dt = DateTime.now();
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

  // console.log("Date:", dt.day);
  // console.log("Reset Day:", resetDay.day);
  // console.log(
  //   DateTime.local(2025, 3, 12).toLocaleString(DateTime.DATETIME_MED),
  // );

  console.log("new Date:", new Date());
  console.log("DateTime.now():", DateTime.now().toJSDate());
  return <SchedulePageView />;
};

export default SchedulePage;

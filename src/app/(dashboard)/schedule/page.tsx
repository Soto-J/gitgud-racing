import { redirect } from "next/navigation";

import { DateTime } from "luxon";

import { getSession } from "@/lib/get-session";

import { getQueryClient, trpc } from "@/trpc/server";

import { SchedulePageView } from "@/modules/schedule/ui/views/schedule-page-view";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

const SchedulePage = async () => {
  const session = await getSession();
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

  console.log("Date:", dt.day);
  console.log("Reset Day:", resetDay.day);
  console.log(
    DateTime.local(2025, 3, 12).toLocaleString(DateTime.DATETIME_MED),
  );

  // console.log("new Date:", new Date());
  // console.log("DateTime.now():", DateTime.now().toJSDate());

  const info = getCurrentSeasonInfo();
  console.log(info);

  //  const currentQuarter = Math.ceil((DateTime.now().month ) / 4)
  //  console.log(currentQuarter)
  return <SchedulePageView />;
};

export default SchedulePage;

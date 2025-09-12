import type { NextRequest } from "next/server";

import { DateTime } from "luxon";
import env from "@/env";

import * as utilities from "@/app/api/cronjobs/utilities";
import * as cacheOps from "@/app/api/cronjobs/cache";

import { getOrRefreshAuthCode } from "@/modules/iracing/server/authentication";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  console.log(
    "Cron job started at:",
    DateTime.now().toLocaleString(DateTime.DATETIME_MED),
  );

  const seasonInfo = utilities.getCurrentSeasonInfo();
  const authCode = await getOrRefreshAuthCode();

  const seriesCacheParams = utilities.createSearchParams({
    season_year: seasonInfo.currentYear,
    season_quarter: seasonInfo.currentQuarter,
  });
  const seriesCached = await cacheOps.cacheSeries({
    seasonYear: seasonInfo.currentYear,
    seasonQuarter: seasonInfo.currentQuarter,
    authCode,
    seriesCacheParams,
  });

  if (!seriesCached?.success) {
    console.error("Cron job error:", seriesCached?.error);
    return Response.json({ success: false }, { status: 500 });
  }

  // const cachedSeasonsSchedule = await cacheOps.cacheSeasonsSchedule({
  //   seasonYear: seasonInfo.currentYear,
  //   seasonQuarter: seasonInfo.currentQuarter,
  //   authCode,
  // });

  // if (cachedSeasonsSchedule.success) {
  //   console.log(`${cachedSeasonsSchedule.message}`);
  // } else {
  //   console.warn(`YURR!!${cachedSeasonsSchedule.message}`);
  // }

  const searchParams = utilities.createSearchParams({
    season_year: seasonInfo.currentYear,
    season_quarter: seasonInfo.currentQuarter,
    event_types: "5",
    official_only: "true",
    race_week_num: seasonInfo.currentRaceWeek,

    start_range_begin: "",
    start_range_end: "",
    cust_id: "",
    team_id: "",
    category_id: "",
  });

  console.log("Calculated search params:", searchParams);

  const cachedWeeklyResults = await cacheOps.cacheWeeklyResults({
    authCode,
    searchParams,
  });

  if (!cachedWeeklyResults) {
    console.error("Cron job error: Failed to cache weekly results.");
    return Response.json({ success: false }, { status: 500 });
  }

  console.log("Cron job completed successfully");
  return Response.json({ success: true });
}

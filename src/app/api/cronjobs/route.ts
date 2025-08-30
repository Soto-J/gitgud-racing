import type { NextRequest } from "next/server";

import env from "@/env";

import * as helper from "@/modules/iracing/server";

import { DateTime } from "luxon";

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

  const authCode = await helper.getOrRefreshAuthCode();

  const seriesCached = await helper.cacheSeries({ authCode });

  if (!seriesCached?.success) {
    console.error("Cron job error:", seriesCached?.error);
    return Response.json({ success: false }, { status: 500 });
  }

  const seasonInfo = getCurrentSeasonInfo();

  const params = {
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
  };

  const searchParams = createSearchParams(params);

  const cachedWeeklyResults = await helper.cacheWeeklyResults({
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

const getCurrentSeasonInfo = () => {
  const year = DateTime.now().year;

  // iRacing seasons typically start on these dates (adjust based on actual schedule)
  const seasonStarts = [
    DateTime.local(year, 3, 12), // Season 1: ~March 12 (Week 0)
    DateTime.local(year, 5, 11), // Season 2: ~June 11 (Week 0)
    DateTime.local(year, 8, 10), // Season 3: ~September 10 (Week 0)
    DateTime.local(year, 11, 10), // Season 4: ~December 10 (Week 0)
  ];

  // Find current season
  let currentSeasonIndex = 0;
  let seasonStartDate = seasonStarts[0];

  if (DateTime.now() < seasonStarts[0]) {
    // Before Season 1 of the current year: treat as last year's Season 4
    currentSeasonIndex = 3;
    seasonStartDate = DateTime.local(year - 1, 11, 10);
  } else {
    for (let i = seasonStarts.length - 1; i >= 0; i--) {
      if (DateTime.now() >= seasonStarts[i]) {
        currentSeasonIndex = i;
        seasonStartDate = seasonStarts[i];
        break;
      }
    }
  }

  // Calculate weeks since season start
  const weeksSinceStart = Math.floor(
    DateTime.now().diff(seasonStartDate).weeks,
  );

  const currentRaceWeek = (
    Math.max(0, Math.min(weeksSinceStart, 12)) - 1
  ).toString();

  const currentQuarter = Math.ceil((DateTime.now().month + 1) / 3).toString();
  const currentSeasonYear = DateTime.now().year.toString();

  return {
    currentRaceWeek,
    currentQuarter,
    currentYear: currentSeasonYear,
  };
};

const createSearchParams = (params: {
  season_year: string;
  season_quarter: string;
  event_types?: string;
  official_only?: string;
  race_week_num?: string;
  start_range_begin?: string;
  start_range_end?: string;
  cust_id?: string;
  team_id?: string;
  category_id?: string;
}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
};

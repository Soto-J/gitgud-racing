import type { NextRequest } from "next/server";
import * as helper from "@/modules/iracing/server/helper";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  console.log("Cron job started at:", new Date().toISOString());

  const authCode = await helper.getOrRefreshAuthCode();

  const seriesCached = await helper.cacheSeries({ authCode });

  if (!seriesCached?.success) {
    console.error("Cron job error:", seriesCached?.error);
    return Response.json({ success: false }, { status: 500 });
  }

  const currentWeek = calculateCurrentWeek();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const params = {
    season_year: "2025",
    season_quarter: currentQuarter,
    event_types: "5",
    official_only: "true",
    race_week_num: "9",

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

const calculateCurrentWeek = () => {
  const now = new Date();
  const year = now.getFullYear();

  // iRacing seasons typically start on these dates (adjust based on actual schedule)
  const seasonStarts = [
    new Date(year, 2, 12), // Season 1: ~March 12 (Week 0)
    new Date(year, 5, 11), // Season 2: ~June 11 (Week 0)
    new Date(year, 8, 10), // Season 3: ~September 10 (Week 0)
    new Date(year, 11, 10), // Season 4: ~December 10 (Week 0)
  ];

  // Find current season
  let currentSeasonIndex = 0;
  let seasonStartDate = seasonStarts[0];

  if (now < seasonStarts[0]) {
    // Before Season 1 of the current year: treat as last year's Season 4
    currentSeasonIndex = 3;
    seasonStartDate = new Date(year - 1, 11, 10);
  } else {
    for (let i = seasonStarts.length - 1; i >= 0; i--) {
      if (now >= seasonStarts[i]) {
        currentSeasonIndex = i;
        seasonStartDate = seasonStarts[i];
        break;
      }
    }
  }

  // Calculate weeks since season start
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceStart = Math.floor(
    (now.getTime() - seasonStartDate.getTime()) / msPerWeek,
  );

  return {
    currentWeek: Math.max(0, Math.min(weeksSinceStart, 12)), // Clamp to [0, 12]
    currentSeason: currentSeasonIndex + 1,
    seasonStartDate,
  };
};

const createSearchParams = (params: {
  series_id?: string;
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

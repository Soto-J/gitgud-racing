import type { NextRequest } from "next/server";
import { eq, gt, and } from "drizzle-orm";

import { seriesWeeklyStatsTable } from "@/db/schemas";
import { db } from "@/db";

import env from "@/env";

import { getSeasonDates, cacheCurrentWeekResults } from "./helper";

const MS_WITHIN_7_DAYS = 7 * 24 * 60 * 60 * 1_000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  console.log(
    "[Cronjob] Started at:",
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
    }).format(new Date()),
  );

  const currentSeason = getSeasonDates();

  const weeklyResults = await db
    .select()
    .from(seriesWeeklyStatsTable)
    .where(
      and(
        eq(seriesWeeklyStatsTable.seasonYear, currentSeason.year),
        eq(seriesWeeklyStatsTable.seasonQuarter, currentSeason.quarter),
        eq(seriesWeeklyStatsTable.raceWeek, currentSeason.raceWeek),
        gt(
          seriesWeeklyStatsTable.updatedAt,
          new Date(Date.now() - MS_WITHIN_7_DAYS),
        ),
      ),
    );

  if (weeklyResults.length > 0) {
    console.log("[Cronjob] Using cached weekly results.");
    console.log(
      `Year ~ ${weeklyResults[0].seasonYear}, Quarter ~ ${weeklyResults[0].seasonQuarter}, Race Week ~ ${weeklyResults[0].raceWeek}`,
    );
    return Response.json({ success: true });
  }

  const cachedWeeklyResults = await cacheCurrentWeekResults(currentSeason);

  if (!cachedWeeklyResults.success || cachedWeeklyResults?.error) {
    console.error(
      `[Cronjob] error: Failed to cache weekly results. ${cachedWeeklyResults.error}`,
    );
    return Response.json({ success: false }, { status: 500 });
  }

  console.log("[Cronjob] completed successfully");
  return Response.json({ success: true });
}

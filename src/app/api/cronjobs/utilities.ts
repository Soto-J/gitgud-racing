import { DateTime } from "luxon";

const IRacingSeasonStarts = [
  { season: 1, start: DateTime.fromISO("2025-03-18T20:00:00") },
  { season: 2, start: DateTime.fromISO("2025-06-17T20:00:00") },
  { season: 3, start: DateTime.fromISO("2025-09-09T20:00:00") },
  { season: 4, start: DateTime.fromISO("2025-09-15T20:00:00") },
];

export const getCurrentSeasonInfo = () => {
  const now = DateTime.now();

  // find which season we're in
  let current = IRacingSeasonStarts[0];

  // default to last season of previous year if before first season
  if (now < current.start) {
    current = IRacingSeasonStarts[IRacingSeasonStarts.length - 1];
    current = {
      season: current.season,
      start: current.start.minus({ years: 1 }),
    };
  } else {
    for (let i = IRacingSeasonStarts.length - 1; i >= 0; i--) {
      if (now >= IRacingSeasonStarts[i].start) {
        current = IRacingSeasonStarts[i];
        break;
      }
    }
  }

  const daysSinceStart = now.diff(current.start, "days").days;
  const weeksSinceStart = Math.floor(daysSinceStart / 7);

  return {
    currentRaceWeek: Math.max(0, Math.min(weeksSinceStart, 11)).toString(),
    currentQuarter: current.season.toString(),
    currentYear: (now < IRacingSeasonStarts[0].start
      ? now.year - 1
      : now.year
    ).toString(),
  };
};

/**
 * Determines if we are currently in a 13th week period
 * 13th week occurs during quarter transitions when regular seasons end
 *
 * @returns {boolean} True if currently in 13th week period
 */
export const isCurrently13thWeek = (): boolean => {
  const seasonInfo = getCurrentSeasonInfo();
  const currentWeek = parseInt(seasonInfo.currentRaceWeek);

  // 13th week typically occurs when race week is 12 or higher
  // (since race weeks are 0-indexed, week 12 is actually the 13th week)
  return currentWeek >= 12;
};

/**
 * Detects if a series is a 13th week or special event series
 *
 * @param seriesName - The name of the series
 * @returns {object} Detection result with flags and event type
 */
export const detectSpecialEventSeries = (seriesName: string) => {
  const lowerName = seriesName.toLowerCase();

  // Check for 13th week series - these have "13th week" in the name
  const is13thWeek = lowerName.includes("13th week");

  // For now, focus only on 13th week detection
  // Can expand later for other special events if needed
  const isSpecialEvent = is13thWeek;

  const specialEventType = is13thWeek ? "13th_week" : null;

  return {
    isSpecialEvent,
    specialEventType,
    is13thWeek,
  };
};

export const createSearchParams = (params: {
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

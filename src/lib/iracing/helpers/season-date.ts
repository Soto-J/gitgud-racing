const MS_PER_DAY = 86_400_000;
const MAX_RACE_WEEK = 11;

const seasonStart = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 20, 0, 0));

export function getSeasonDates(now = new Date()) {
  const year = now.getFullYear();

  // iRacing seasons with their start dates
  // Season 1 starts in mid-December of the previous year
  // Each season is ~12 weeks long
  const currentYearSeasons = [
    { season: 1, start: seasonStart(year - 1, 11, 16), year }, // Dec 16 (prev year)
    { season: 2, start: seasonStart(year, 2, 11), year }, // Mar 11
    { season: 3, start: seasonStart(year, 5, 3), year }, // Jun 3
    { season: 4, start: seasonStart(year, 7, 26), year }, // Aug 26
  ];

  // Also check next year's Season 1 in case we're in late December
  const nextYearS1 = {
    season: 1,
    start: seasonStart(year, 11, 16),
    year: year + 1,
  };

  // Combine all possible seasons to check
  const allSeasons = [...currentYearSeasons, nextYearS1];

  // Find which season we're in by checking most recent season that has started
  let currentSeason = currentYearSeasons[0];

  for (let i = allSeasons.length - 1; i >= 0; i--) {
    if (now >= allSeasons[i].start) {
      currentSeason = allSeasons[i];
      break;
    }
  }

  // Calculate weeks since season start
  const weeksSinceStart = Math.floor(
    (now.getTime() - currentSeason.start.getTime()) / (MS_PER_DAY * 7),
  );

  return {
    raceWeek: Math.max(0, Math.min(weeksSinceStart, MAX_RACE_WEEK)),
    quarter: currentSeason.season,
    year: currentSeason.year,
  };
}

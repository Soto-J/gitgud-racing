const MS_PER_DAY = 86_400_000;
const MAX_RACE_WEEK = 11;

const seasonStart = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 20, 0, 0));

export function getSeasonDates(now = new Date()) {
  const year = now.getFullYear();

  const seasons = [
    { season: 1, start: seasonStart(year, 2, 18) }, // Mar
    { season: 2, start: seasonStart(year, 5, 17) }, // Jun
    { season: 3, start: seasonStart(year, 8, 9) }, // Sep
    { season: 4, start: seasonStart(year, 11, 15) }, // Dec
  ];

  // Find which season we're in
  let currentSeason = seasons[0];
  let seasonYear = year;

  // If before first season of the year, use last season of previous year
  if (now < currentSeason.start) {
    currentSeason = {
      season: 4,
      start: seasonStart(year - 1, 11, 15),
    };

    seasonYear = year - 1;
  } else {
    // Find the most recent season that has started
    for (let i = seasons.length - 1; i >= 0; i--) {
      if (now >= seasons[i].start) {
        currentSeason = seasons[i];
        break;
      }
    }
  }

  // Calculate weeks since season start
  const weeksSinceStart = Math.floor(
    (now.getTime() - currentSeason.start.getTime()) / (MS_PER_DAY * 7),
  );

  return {
    raceWeek: Math.max(0, Math.min(weeksSinceStart, MAX_RACE_WEEK)),
    quarter: currentSeason.season,
    year: seasonYear,
  };
}

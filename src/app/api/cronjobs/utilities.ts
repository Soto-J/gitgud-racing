import { DateTime } from "luxon";

import { GetSeasonsResponseType } from "@/modules/iracing/server/procedures/season-schedule/schema";

const IRacingSeasonStarts = [
  { season: 1, start: DateTime.fromISO("2025-03-18") },
  { season: 2, start: DateTime.fromISO("2025-05-17") },
  { season: 3, start: DateTime.fromISO("2025-06-12") },
  { season: 4, start: DateTime.fromISO("2025-12-16") },
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
    currentRaceWeek: Math.min(weeksSinceStart - 1, 11).toString(),
    currentQuarter: current.season.toString(),
    currentYear: (now < IRacingSeasonStarts[0].start
      ? now.year - 1
      : now.year
    ).toString(),
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

export const buildSeasonsData = (seasons: GetSeasonsResponseType[]) => {
  return seasons.map((season) => ({
    id: season.season_id,
    seriesId: season.series_id,
    seasonName: season.season_name,
    seasonShortName: season.season_short_name,
    seasonYear: season.season_year,
    seasonQuarter: season.season_quarter,
    active: season.active,
    complete: season.complete,
    official: season.official,
    licenseGroup: season.license_group,
    crossLicense: season.cross_license,
    maxWeeks: season.max_weeks,
    raceWeek: season.race_week,
    drops: season.drops,
    raceWeekToMakeDivisions: season.race_week_to_make_divisions,
    fixedSetup: season.fixed_setup,
    multiclass: season.multiclass,
    incidentLimit: season.incident_limit,
    incidentWarnMode: season.incident_warn_mode,
    incidentWarnParam1: season.incident_warn_param1,
    incidentWarnParam2: season.incident_warn_param2,
    connectionBlackFlag: season.connection_black_flag,
    maxTeamDrivers: season.max_team_drivers,
    minTeamDrivers: season.min_team_drivers,
    driverChanges: season.driver_changes,
    driverChangeRule: season.driver_change_rule,
    qualifierMustStartRace: season.qualifier_must_start_race,
    gridByClass: season.grid_by_class,
    opDuration: season.op_duration,
    openPracticeSessionTypeId: season.open_practice_session_type_id,
    numFastTows: season.num_fast_tows,
    numOptLaps: season.num_opt_laps,
    scheduleDescription: season.schedule_description,
    startDate: season.start_date,
    regUserCount: season.reg_user_count,
  }));
};

export const buildScheduleData = (
  schedules: GetSeasonsResponseType["schedules"],
) => {
  return schedules.map((schedule) => ({
    seasonId: schedule.season_id,
    raceWeekNum: schedule.race_week_num,
    scheduleName: schedule.schedule_name,
    seriesId: schedule.series_id,
    seriesName: schedule.series_name,
    category: schedule.category,
    categoryId: schedule.category_id,
    trackId: schedule.track.track_id,
    trackName: schedule.track.track_name,
    specialEventType: schedule.special_event_type || 0,
    sessionMinutes: schedule.race_time_descriptors[0]?.session_minutes || 0,
    tempUnit: schedule.weather.temp_units,
    tempValue: schedule.weather.temp_value,
    skies: schedule.weather.skies,
    windUnits: schedule.weather.wind_units,
    windValue: schedule.weather.wind_value,
    timeofDay: schedule.weather.time_of_day,
    trackWater: schedule.weather.track_water,
    allow_fog: schedule.weather.allow_fog,
    startDate: schedule.start_date,
    firstSessionTime:
      schedule.race_time_descriptors[0]?.first_session_time || "00:00:00",
    repeatMinutes: schedule.race_time_descriptors[0]?.repeat_minutes || 0,
    weekEndTime: schedule.week_end_time,
  }));
};

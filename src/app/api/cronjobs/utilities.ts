import { GetSeasonsResponseType } from "@/modules/iracing/server/procedures/season-schedule/schema";
import { DateTime } from "luxon";

export const getCurrentSeasonInfo = () => {
  const year = DateTime.now().year;

  // iRacing seasons typically start on these dates 
  const seasonStarts = [
    DateTime.local(year, 3, 12), // Season 1: ~March 18 (Week 0)
    DateTime.local(year, 5, 17), // Season 2: ~June 17 (Week 0)
    DateTime.local(year, 8, 16), // Season 3: ~September 16 (Week 0)
    DateTime.local(year, 11, 16), // Season 4: ~December 15 (Week 0)
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

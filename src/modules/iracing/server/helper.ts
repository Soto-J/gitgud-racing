import CryptoJS from "crypto-js";

import { eq, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import {
  iracingAuthTable,
  seriesTable,
  seriesWeeklyStatsTable,
} from "@/db/schema";

import { COOKIE_EXPIRES_IN_MS, IRACING_URL } from "@/constants";

import {
  TransformLicensesInput,
  TransformLicensesOutput,
  LicenseDiscipline,
  IracingGetAllSeriesResponse,
  CacheWeeklyResultsInput,
  SeasonResultsResponse,
} from "@/modules/iracing/types";

const requiredEnvVars = {
  email: process.env.IRACING_EMAIL,
  password: process.env.IRACING_PASSWORD,
  userId: process.env.MY_USER_ID,
};

export const getOrRefreshAuthCode = async () => {
  const IRACING_EMAIL = process.env?.IRACING_EMAIL;
  const IRACING_PASSWORD = process.env?.IRACING_PASSWORD;
  const MY_USER_ID = process.env?.MY_USER_ID;
  if (!MY_USER_ID) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: MY_USER_ID`,
    });
  }
  if (!IRACING_PASSWORD) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_PASSWORD`,
    });
  }
  if (!IRACING_EMAIL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required environment variables: IRACING_EMAIL`,
    });
  }

  const iracingAuthInfo = await db
    .select()
    .from(iracingAuthTable)
    .where(eq(iracingAuthTable.userId, requiredEnvVars.userId!))
    .then((value) => value[0]);

  // Check if cached auth is still valid
  if (iracingAuthInfo?.expiresAt && iracingAuthInfo.expiresAt > new Date()) {
    const timeLeft = iracingAuthInfo.expiresAt.getTime() - Date.now();
    console.log(
      `Using cached iRacing auth (expires in ${Math.round(timeLeft / 1000 / 60)} minutes)`,
    );

    return iracingAuthInfo.authCode;
  }

  // Refresh iRacing authcode
  console.log("Refreshing iRacing auth...");
  try {
    const hashedPassword = CryptoJS.enc.Base64.stringify(
      CryptoJS.SHA256(IRACING_PASSWORD + IRACING_EMAIL.toLowerCase()),
    );

    if (!hashedPassword) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to hash password.",
      });
    }

    const response = await fetch(`${IRACING_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        email: IRACING_EMAIL,
        password: hashedPassword,
      }),
      credentials: "include", // Important for cookies
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to authenticate iRacing: ${response.status}`,
      });
    }

    const authCode = response.headers
      .get("set-cookie")
      ?.match(/authtoken_members=([^;]+)/)?.[1];

    if (!authCode) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No valid auth cookie received from iRacing",
      });
    }

    await db
      .insert(iracingAuthTable)
      .values({
        userId: MY_USER_ID,
        authCode,
        expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
      })
      .onDuplicateKeyUpdate({
        set: {
          authCode,
          expiresAt: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
        },
      });

    return authCode;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
};

const fetchData = async ({
  query,
  authCode,
}: {
  query: string;
  authCode: string;
}) => {
  try {
    const initialResponse = await fetch(`${IRACING_URL}${query}`, {
      headers: {
        Cookie: `authtoken_members=${authCode}`,
      },
    });

    if (!initialResponse.ok) {
      throw new Error(
        `Failed to get data link. Status: ${initialResponse.status}`,
      );
    }

    const data = await initialResponse.json();

    // Documentation doesnt require a link
    if (!data?.link) {
      return data;
    }

    try {
      const linkResponse = await fetch(data.link);

      if (!linkResponse.ok) {
        throw new Error(
          `Failed to fetch data from the provided link. Status ${linkResponse.status}`,
        );
      }
      const linkData = await linkResponse.json();
      // console.log({ linkData });
      return linkData;
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : typeof downloadError === "string"
            ? downloadError
            : "Unknown error occurred while downloading iRacing data.";

      throw new Error(message);
    }
  } catch (error) {
    console.error("iRacing API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("401")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "iRacing authentication failed.",
        });
      }

      if (
        error.message.includes("404") ||
        error.message.includes("did not contain a data link")
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Requested iRacing resource not found.",
        });
      }

      if (error.message.includes("Failed to parse")) {
        throw new TRPCError({
          code: "PARSE_ERROR",
          message: "Failed to parse iRacing API response.",
        });
      }

      // Default generic error
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    // Fallback for non-Error objects
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unknown error occurred while fetching iRacing data.",
    });
  }
};

// Update series every 7 days
const cacheSeries = async ({ authCode }: { authCode: string }) => {
  try {
    const cachedSeries = await db
      .select()
      .from(seriesTable)
      .where(
        gt(
          seriesTable.updatedAt,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ),
      );

    if (cachedSeries.length > 0) {
      console.log("Using cashed series");
      // console.log(cachedSeries);
      return { success: true };
    }

    console.log("Refreshing All Series");
    const data: IracingGetAllSeriesResponse[] = await fetchData({
      query: `/data/series/get`,
      authCode: authCode,
    });

    if (!data) {
      throw new Error("Failed to get series");
    }

    const insertValues = data.map((item) => ({
      seriesId: item.series_id.toString(),
      category: item.category,
      seriesName: item.series_name,
    }));

    await db.delete(seriesTable);
    await db.insert(seriesTable).values(insertValues);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in cacheSeries:", error);
      return { success: false, error: error.message };
    }
  }
};

const cacheWeeklyResults = async ({
  authCode,
  params,
}: {
  authCode: string;
  params: {
    season_id: string;
    event_type: string;
    race_week_num: string;
  };
}) => {
  try {
    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .where(
        gt(
          seriesWeeklyStatsTable.updatedAt,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ),
      );

    if (weeklyResults.length > 0) {
      console.log("Using cached weekly results.");
      return { success: true };
    }

    console.log("Refreshing weekly results.");

    const allSessions: SeasonResultsResponse[] = await fetchData({
      query: `/data/results/season_results?season_id=${params.season_id}&event_type=${params.event_type}&race_week_num=${params.race_week_num}`,
      authCode: authCode,
    });

    const groupedBySeries = allSessions.reduce(
      (obj, session) => {
        const seriesName = session.car_classes[0].name; // or short_name

        if (!obj[seriesName]) {
          obj[seriesName] = [];
        }

        obj[seriesName].push(session);
        return obj;
      },
      {} as Record<string, SeasonResultsResponse[]>,
    );

    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    const perRaceStats = Object.entries(groupedBySeries).map(
      ([seriesName, sessions]) => {
        const groupedByStartTime = sessions.reduce(
          (obj, session) => {
            if (!obj[session.start_time]) {
              obj[session.start_time] = [];
            }
            obj[session.start_time].push(session);
            return obj;
          },
          {} as Record<string, SeasonResultsResponse[]>,
        );

        const totalRaces = Object.keys(groupedByStartTime).length;
        const totalSplits = sessions.length;
        const totalDrivers = sessions.reduce(
          (sum, session) => sum + session.num_drivers,
          0,
        );

        const averageSplits = (totalSplits / totalRaces).toString();
        const averageEntrants = (totalDrivers / totalSplits).toString();
        const seasonYear = new Date(sessions[0].start_time).getFullYear();

        return {
          sessionId: sessions[0].session_id,
          subSessionId: sessions[0].subsession_id,
          seasonYear: seasonYear,
          seasonQuarter: currentQuarter,
          name: seriesName,
          shortName: sessions[0].car_classes[0].short_name,
          trackName: sessions[0].track.track_name,
          raceWeek: sessions[0].race_week_num,

          startTime: sessions[0].start_time,
          strengthOfField: sessions[0].event_strength_of_field,
          totalSplits,
          totalDrivers,
          averageEntrants,
          averageSplits,
        };
      },
    );

    await db.insert(seriesWeeklyStatsTable).values(perRaceStats);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in cacheWeeklyResults:", error);
      return { success: false, error: error.message };
    }
  }
};

const transformLicenses = (
  member: TransformLicensesInput,
): TransformLicensesOutput => {
  if (!member?.licenses) {
    const { licenses, ...restData } = member;
    return {
      ...restData,
      licenses: null,
    };
  }

  // Extract the licenses object
  const licenseData = member.licenses;

  // Create an array of license objects
  const disciplinesArray: LicenseDiscipline[] = [
    {
      category: "Oval",
      iRating: licenseData.ovalIRating,
      safetyRating: licenseData.ovalSafetyRating,
      licenseClass: licenseData.ovalLicenseClass,
    },
    {
      category: "Sports",
      iRating: licenseData.sportsCarIRating,
      safetyRating: licenseData.sportsCarSafetyRating,
      licenseClass: licenseData.sportsCarLicenseClass,
    },
    {
      category: "Formula",
      iRating: licenseData.formulaCarIRating,
      safetyRating: licenseData.formulaCarSafetyRating,
      licenseClass: licenseData.formulaCarLicenseClass,
    },
    {
      category: "Dirt Oval",
      iRating: licenseData.dirtOvalIRating,
      safetyRating: licenseData.dirtOvalSafetyRating,
      licenseClass: licenseData.dirtOvalLicenseClass,
    },
    {
      category: "Dirt Road",
      iRating: licenseData.dirtRoadIRating,
      safetyRating: licenseData.dirtRoadSafetyRating,
      licenseClass: licenseData.dirtRoadLicenseClass,
    },
  ];

  // Excluding the old licenses field
  const { licenses, ...restOfMember } = member;

  return {
    ...restOfMember,
    licenses: {
      id: licenses.id,

      disciplines: disciplinesArray,
    },
  };
};

export { transformLicenses, fetchData, cacheSeries, cacheWeeklyResults };

import CryptoJS from "crypto-js";

import { desc, eq, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import fs from "fs";
import path from "path";

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
  IracingSeriesResultsResponse,
} from "@/modules/iracing/types";

export const getOrRefreshAuthCode = async () => {
  const IRACING_EMAIL = process.env?.IRACING_EMAIL;
  const IRACING_PASSWORD = process.env?.IRACING_PASSWORD;
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

    console.log(response);
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
        `Initial fetch failed, Status: ${initialResponse.status}`,
      );
    }

    const data = await initialResponse.json();

    // Documentation doesnt require a link
    if (!data?.link && data.type !== "search_series_results") {
      return data;
    }

    let link = data?.link ?? "";

    if (data?.type === "search_series_results") {
      const chunkInfo = data.data.chunk_info;

      const baseDownloadUrl = chunkInfo.base_download_url;
      const [chunkFileNames] = chunkInfo.chunk_file_names;

      if (!chunkFileNames) {
        throw new Error("No chunk file names found");
      }

      link = `${baseDownloadUrl}${chunkFileNames}`;
      console.log("Download URL:", link);
    }

    if (!link) {
      throw new Error("No download link available from iRacing response.");
    }

    try {
      const linkResponse = await fetch(link);

      if (!linkResponse.ok) {
        throw new Error(
          `Failed to fetch data from the provided link. Status ${linkResponse.status}`,
        );
      }

      const linkData = await linkResponse.json();

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
      // Map specific errors to TRPC codes
      const errorMappings = [
        {
          includes: "401",
          code: "UNAUTHORIZED",
          message: "iRacing authentication failed.",
        },
        {
          includes: "404",
          code: "NOT_FOUND",
          message: "Requested iRacing resource not found.",
        },
        {
          includes: "Failed to parse",
          code: "PARSE_ERROR",
          message: "Failed to parse iRacing API response.",
        },
      ] as const;

      for (const mapping of errorMappings) {
        if (error.message.includes(mapping.includes)) {
          throw new TRPCError({
            code: mapping.code,
            message: mapping.message,
          });
        }
      }

      // Default error
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

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
      console.log("Using cached series");
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

const IRACING_IMAGE_URL = "https://images-static.iracing.com";
// const cacheSeriesImage2 = async () => {
//   const authCode = await getOrRefreshAuthCode();

//   // Get the official asset mappings
//   const data = await fetchData({
//     query: `/data/series/assets`,
//     authCode,
//   });

//   // Let's see what other series have and try different patterns
//   const seriesWithLogos: any = Object.values(data)
//     .filter((series: any) => series?.logo)
//     .slice(0, 10);

//   console.log(
//     "Series with logos:",
//     seriesWithLogos.map((s: any) => ({
//       id: s.series_id,
//       logo: s.logo,
//     })),
//   );

//   const testUrls = [
//     `https://images-static.iracing.com/${seriesWithLogos[0].logo}`,
//     `https://images-static.iracing.com/series/${seriesWithLogos[0].logo}`,
//     `https://images-static.iracing.com/logos/${seriesWithLogos[0].logo}`,

//     `https://images-static.iracing.com/${seriesWithLogos[0].series_id}.png`,
//   ];

//   for (const url of testUrls) {
//     try {
//       console.log(`\nTrying: ${url}`);
//       const response = await fetch(url, {
//         headers: {
//           Cookie: `authtoken_members=${authCode}`,
//         },
//       });

//       console.log(`Status: ${response.status}`);
//       console.log(`Content-Type: ${response.headers.get("content-type")}`);

//       if (response.ok) {
//         console.log("SUCCESS! This URL pattern works");
//         break;
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         console.log(`Error: ${error.message}`);
//       }
//     }
//   }
// };

// Download series assets to public/series-logos
const cacheSeriesImages = async () => {
  const allSeries = await db.select().from(seriesTable);

  if (!allSeries || allSeries.length === 0) {
    console.error("No series found.");
    return;
  }

  // Create directory if it doesn't exist
  const logoDir = path.join(process.cwd(), "public", "series-logos");
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  const authCode = await getOrRefreshAuthCode();

  try {
    const promiseArr = allSeries.map(async (series) => {
      const imageUrl = `${IRACING_URL}/data/series/${series.seriesId}/logo`;

      const response = await fetch(imageUrl, {
        headers: {
          Cookie: `authtoken_members=${authCode}`,
        },
      });

      if (!response.ok) {
        console.log("Response", response);
        throw new Error(
          `Failed to fetrch image for series ${series.seriesName}, seriesId${series.seriesId}`,
        );
      }

      console.log("Response", response);
      return {
        seriesId: series.seriesId,
        seriesName: series.seriesName,
        buffer: await response.arrayBuffer(),
      };
    });

    const results = await Promise.allSettled(promiseArr);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { seriesId, seriesName, buffer } = result.value;

        const filename = `${seriesName}.png`;
        const filepath = path.join(logoDir, filename);

        try {
          fs.writeFileSync(filepath, Buffer.from(buffer));
        } catch (writeError) {
          console.error(`Failed to write ${filename}:`, writeError);
        }
      }
    });

    console.log(`Finished caching series images. Check ${logoDir}`);
  } catch (error) {
    console.error(error);
  }
};

const cacheWeeklyResults = async ({
  authCode,
  searchParams,
}: {
  authCode: string;
  searchParams: string;
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

    const allSeries = await db
      .select()
      .from(seriesTable)
      .orderBy(desc(seriesTable.seriesId));

    if (!allSeries) {
      console.error("Failed to retrieve series table.");
      return { success: false };
    }

    const promiseArr = allSeries.map((series) =>
      fetchData({
        query: `/data/results/search_series${searchParams}&series_id=${series.seriesId}`,
        authCode: authCode,
      }),
    );

    const seriesResultsSettled = await Promise.allSettled(promiseArr);

    const seriesResults: IracingSeriesResultsResponse[][] = seriesResultsSettled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const perRaceStats = seriesResults
      .filter((series) => series.length > 0)
      .map((series) => {
        const uniqueRaces = series.reduce(
          (obj, session) => {
            if (!obj[session.start_time]) {
              obj[session.start_time] = [];
            }

            obj[session.start_time].push(session);
            return obj;
          },
          {} as Record<string, IracingSeriesResultsResponse[]>,
        );

        const totalRaces = Object.values(uniqueRaces).length;

        const totalSplits = series.length;

        const totalDrivers = series.reduce(
          (total, session) => total + session.num_drivers,
          0,
        );

        const avgSplitPerRace =
          totalRaces > 0 ? (totalSplits / totalRaces).toFixed(2) : "0";
        const avgEntrantPerSeries =
          totalSplits > 0 ? (totalDrivers / totalSplits).toFixed(2) : "0";

        return {
          seriesId: series[0].series_id.toString(),
          seasonId: series[0].season_id.toString(),
          sessionId: series[0].session_id.toString(),
          name: series[0].series_name.trim(),
          seasonYear: series[0].season_year,
          seasonQuarter: series[0].season_quarter,
          raceWeek: series[0].race_week_num,
          trackName: series[0].track.track_name.trim(),
          startTime: series[0].start_time.trim(),
          totalSplits,
          totalDrivers,
          strengthOfField: series[0].event_strength_of_field,
          averageEntrants: avgEntrantPerSeries,
          averageSplits: avgSplitPerRace,
        };
      });

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

export {
  transformLicenses,
  fetchData,
  cacheSeries,
  cacheWeeklyResults,
  cacheSeriesImages,
  // cacheSeriesImage2,
};

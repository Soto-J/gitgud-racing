import { DateTime } from "luxon";

import {
  TransformLicensesInput,
  TransformLicensesOutput,
  LicenseDiscipline,
  ChartDataRecord,
} from "@/modules/iracing/types";

/**
 * Transforms license data from database format to client-friendly format
 *
 * This function converts the flat license structure stored in the database
 * into a more structured format with separate discipline objects. It handles
 * cases where license data may be missing or incomplete.
 *
 * @param member - Member data including license information from database
 *
 * @returns {TransformLicensesOutput} Transformed member data with structured licenses
 *
 * @example
 * ```typescript
 * const member = {
 *   user: { id: "123", name: "John" },
 *   licenses: {
 *     ovalIRating: 2500,
 *     ovalSafetyRating: "3.45",
 *     ovalLicenseClass: "A",
 *     // ... other license data
 *   }
 * };
 *
 * const transformed = transformLicenses(member);
 * console.log(transformed.licenses.disciplines[0]);
 * // { category: "Oval", iRating: 2500, safetyRating: "3.45", licenseClass: "A" }
 * ```
 */
export const transformLicenses = (
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

/**
 * Determines if chart data needs to be refreshed based on iRacing's weekly schedule
 *
 * iRacing releases new data every Monday at 8 PM EST. This function checks if enough
 * time has passed since the last data update to warrant fetching fresh data from the
 * API. It accounts for iRacing's specific release schedule and timezone.
 *
 * @param latestRecord - The most recent chart data record from the database,
 *                       or undefined if no data exists
 *
 * @returns {boolean} true if fresh data should be fetched (no existing data OR
 *                    current time is past the next Monday 8 PM EST after last update)
 *
 * @example
 * ```typescript
 * const chartData = await db.select().from(userChartDataTable).orderBy(desc(updatedAt));
 * const shouldRefresh = shouldRefreshChartData(chartData[0]);
 *
 * if (shouldRefresh) {
 *   // Fetch fresh data from iRacing API
 *   const newData = await fetchData({ query: "/data/...", authCode });
 * }
 * ```
 *
 * @example
 * // If last update was Wednesday, and today is the following Tuesday
 * // Next Monday would be 5 days after Wednesday, so refresh would be needed
 * shouldRefreshChartData(lastRecord) // returns true
 */
export const shouldRefreshChartData = (
  latestRecord: ChartDataRecord | undefined,
): boolean => {
  if (!latestRecord) return true;

  return (
    DateTime.now() >=
    DateTime.fromJSDate(latestRecord.updatedAt)
      .setZone("America/New_York")
      .set({
        weekday: 1,
        hour: 20,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .plus({ day: 7 })
  );
};

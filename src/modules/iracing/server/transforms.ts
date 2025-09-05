import { IRacingLicense, TransformLicenseData } from "@/modules/iracing/types";

/**
 * Maps iRacing API license data to database format
 *
 * This function transforms the license data received from iRacing's API
 * into the flat structure required for database storage. It handles
 * category mapping from iRacing's naming convention to the database
 * field naming and normalizes license classes.
 *
 * @param licenses - Array of license data from iRacing API
 *
 * @returns Database-formatted license object with all disciplines
 *
 * @example
 * ```typescript
 * const iracingLicenses = [
 *   {
 *     category: "oval",
 *     irating: 2500,
 *     safety_rating: 3.45,
 *     group_name: "Class A"
 *   },
 *   // ... other licenses
 * ];
 *
 * const dbData = mapIRacingLicensesToDb(iracingLicenses);
 * console.log(dbData);
 * // {
 * //   ovalIRating: 2500,
 * //   ovalSafetyRating: "3.45",
 * //   ovalLicenseClass: "A",
 * //   // ... other disciplines
 * // }
 * ```
 */
export const mapIRacingLicensesToDb = (
  licenses: IRacingLicense[],
): TransformLicenseData => {
  const categoryMap = {
    oval: "oval",
    sports_car: "sportsCar",
    formula_car: "formulaCar",
    dirt_oval: "dirtOval",
    dirt_road: "dirtRoad",
  } as const;

  // Ensure only return valid license classes
  const normalizeClass = (cls: string): "A" | "B" | "C" | "D" | "R" => {
    if (cls === "Rookie") return "R";

    if (["A", "B", "C", "D", "R"].includes(cls)) {
      return cls as "A" | "B" | "C" | "D" | "R";
    }

    return "R";
  };

  // Initialize with default values for all categories
  const defaultLicenseData = {
    ovalIRating: 1350,
    ovalSafetyRating: "2.50",
    ovalLicenseClass: "R" as const,
    sportsCarIRating: 1350,
    sportsCarSafetyRating: "2.50",
    sportsCarLicenseClass: "R" as const,
    formulaCarIRating: 1350,
    formulaCarSafetyRating: "2.50",
    formulaCarLicenseClass: "R" as const,
    dirtOvalIRating: 1350,
    dirtOvalSafetyRating: "2.50",
    dirtOvalLicenseClass: "R" as const,
    dirtRoadIRating: 1350,
    dirtRoadSafetyRating: "2.50",
    dirtRoadLicenseClass: "R" as const,
  };

  return licenses.reduce((acc, license) => {
    const category = categoryMap[license.category as keyof typeof categoryMap];

    if (!category) return acc;

    const licenseClass = license.group_name.replace("Class ", "").trim();
    const normalizedClass = licenseClass === "Rookie" ? "R" : licenseClass;

    return {
      ...acc,
      [`${category}IRating`]: license.irating || 1350, // Use 1350 if no irating
      [`${category}SafetyRating`]: license.safety_rating.toFixed(2),
      [`${category}LicenseClass`]: normalizeClass(normalizedClass),
    };
  }, defaultLicenseData as TransformLicenseData);
};

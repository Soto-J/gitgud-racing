/** Timeout duration for API requests in milliseconds */
export const API_TIMEOUT_MS = 10000; // 10 seconds

export const chartTypeMap = {
  1: "iRating",
  2: "TT Rating",
  3: "License/SR",
} as const;
export const categoryMap = {
  1: "Oval",
  2: "Road",
  3: "Dirt Oval",
  4: "Dirt Road",
  5: "Sport",
  6: "Formula",
} as const;
export const evenTypesMap = {
  2: "Practice",
  3: "Qualify",
  4: "Time Trial",
  5: "Race",
} as const;

export const seedData = [
  {
    category: "Oval" as const,
    iRating: null,
    safetyRating: null,
    licenseClass: "R",
  },
  {
    category: "Sports" as const,
    iRating: null,
    safetyRating: null,
    licenseClass: "R",
  },
  {
    category: "Formula" as const,
    iRating: null,
    safetyRating: null,
    licenseClass: "R",
  },
  {
    category: "Dirt Oval" as const,
    iRating: null,
    safetyRating: null,
    licenseClass: "R",
  },
  {
    category: "Dirt Road" as const,
    iRating: null,
    safetyRating: null,
    licenseClass: "R",
  },
];

export const IRACING_CHART_TYPE_IRATING = 1;

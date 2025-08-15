import { TRPCError } from "@trpc/server";

import { IRACING_URL } from "@/constants";

import {
  TransformLicensesInput,
  TransformLicensesOutput,
  LicenseDiscipline,
} from "@/modules/iracing/types";

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

      return await linkResponse.json();
    } catch (downloadError) {
      if (downloadError instanceof Error) return downloadError.message;
      if (typeof downloadError === "string") return downloadError;
      return "Unknown error occurred";
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

export { transformLicenses, fetchData };

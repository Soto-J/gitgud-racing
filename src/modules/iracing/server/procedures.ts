import z from "zod";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, iracingProcedure } from "@/trpc/init";

import { IRACING_URL } from "@/constants";

/*
// "https://members-ng.iracing.com/data/member/info",

  body: {
    all: {
      link: 'https://members-ng.iracing.com/data/doc',
      note: 'Documentation for all service methods can be accessed here.'
    },
    service: {
      link: 'https://members-ng.iracing.com/data/doc/car',
      note: 'Each service has its own documentation page, like above.'
    },
    method: {
      link: 'https://members-ng.iracing.com/data/doc/car/assets',
      note: 'Each service method also has a documentation page.'
    }
  }
*/
export const iracingRouter = createTRPCRouter({
  getDocumentation: iracingProcedure.query(async ({ ctx }) => {
    const response = await fetch(`${IRACING_URL}/doc`, {
      headers: {
        Cookie: `authtoken_members=${ctx.iracingAuthData.authCookie}`,
      },
    });

    if (!response) {
      return {
        success: false,
        message: "Error: Problem fetching iRacing documentation",
      };
    }

    const { link } = await response.json();
    const linkResponse = await fetch(link);

    return await linkResponse.json();
  }),

  getUser: iracingProcedure
    .input(z.object({ custId: z.string() }))
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${IRACING_URL}/member/get?cust_ids=${input.custId}`,
        {
          headers: {
            Cookie: `authtoken_members=${ctx.iracingAuthData.authCookie}`,
          },
        },
      );

      if (!response) {
        return {
          success: false,
          message: "Error: Problem fetching iRacing user",
        };
      }

      const { link } = await response.json();
      const linkResponse = await fetch(link);

      return await linkResponse.json();
    }),
});

const fetchData = async ({
  query,
  authCookie,
}: {
  query: string;
  authCookie: string;
}) => {
  try {
    const initialResponse = await fetch(`${IRACING_URL}${query}`, {
      headers: {
        Cookie: `authtoken_members=${authCookie}`,
      },
    });

    if (!initialResponse.ok) {
      throw new Error(
        `Failed to get data link. Status: ${initialResponse.status}`,
      );
    }

    const { link } = await initialResponse.json();

    if (!link) throw new Error(`Failed to get data link`);

    const linkResponse = await fetch(link);

    if (!linkResponse.ok) {
      throw new Error(
        `Failed to fetch data from the provided link. Status ${linkResponse.status}`,
      );
    }

    return await linkResponse.json();
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

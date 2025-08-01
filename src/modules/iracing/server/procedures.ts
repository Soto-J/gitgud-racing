import z from "zod";

import { IRACING_URL } from "@/constants";

import { createTRPCRouter, iracingProcedure } from "@/trpc/init";

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

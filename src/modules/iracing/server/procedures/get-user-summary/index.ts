import { iracingProcedure } from "@/trpc/init";

import {
  fetchIracingData,
  throwIracingError,
} from "@/modules/iracing/server/api";

import { GetUserSummaryResponse } from "@/modules/iracing/server/procedures/get-user-summary/schema";
import { IRACING_URL } from "@/constants";

export const getUserSummaryProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    const res = await fetchIracingData("/data", ctx.iracingAccessToken);

    if (!res.ok) {
      throwIracingError(res.error, res.message);
    }

    return res.data;

    const initialResponse = await fetch(`${IRACING_URL}/data`, {
      headers: {
        Authorization: `Bearer ${ctx.iracingAccessToken}`,
      },
    });

    console.log("initial", initialResponse);

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error("Error response:", errorText);
      throw new Error(
        `iRacing API error: ${initialResponse.status} - ${errorText}`,
      );
    }

    const dataLinks = await initialResponse.json();
    // console.log("Data Links:", dataLinks);

    const linkResponse = await fetch(dataLinks.all.link, {
      headers: {
        Authorization: `Bearer ${ctx.iracingAccessToken}`,
      },
    });

    const data = await linkResponse.json();

    // console.log("Link Data", data);
    // Validate and parse the API response
    // const userSummary = GetUserSummaryResponse.parse(responseData);

    // return userSummary || null;
  },
);

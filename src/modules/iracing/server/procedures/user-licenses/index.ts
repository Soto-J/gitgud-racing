import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { account as accountTable } from "@/db/schemas";
import { db } from "@/db";

import {
  UserInputSchema,
  UserResponseSchema,
} from "@/modules/iracing/server/procedures/user-licenses/types/schema";

import { fetchIracingData } from "@/modules/iracing/server/api";

export const userLicensesProcedure = iracingProcedure
  .input(UserInputSchema)
  .query(async ({ ctx, input }) => {
    const [account] = await db
      .select({ custId: accountTable.accountId })
      .from(accountTable)
      .where(eq(accountTable.userId, input.userId));

    const response = await fetchIracingData(
      `/data/member/get?cust_ids=${Number(account.custId)}&include_licenses=true`,
      ctx.iracingAccessToken,
    );

    if (!response.ok) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    console.log({ response });

    const data = UserResponseSchema.parse(response.data);

    return {
      lastLogin: data.members[0].last_login,
      memberSince: data.members[0].member_since,
      licenses: data.members[0].licenses,
    };
  });

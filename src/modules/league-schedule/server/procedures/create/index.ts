import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { db } from "@/db";
import { leagueScheduleTable } from "@/db/schemas";

import { CreateLeagueScheduleInputSchema } from "./types/schema";

export const createProcedure = protectedProcedure
  .input(CreateLeagueScheduleInputSchema)
  .mutation(async ({ input }) => {
    const { date, ...restOfInput } = input;

    return await db.insert(leagueScheduleTable).values({
      ...restOfInput,
      date: new Date(date),
    });
  });

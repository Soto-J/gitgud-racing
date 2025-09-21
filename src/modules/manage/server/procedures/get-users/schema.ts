import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "./params";

export const GetUsersInputSchema = z.object({
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().nullish(),
});

export type GetUsersInput = z.infer<typeof GetUsersInputSchema>;

export type ManageGetUser = inferRouterOutputs<AppRouter>["manage"]["getUser"];

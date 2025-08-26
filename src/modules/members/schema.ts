import { z } from "zod";

import {
  DEFAULT_PAGE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from "@/modules/members/constants";

export const GetOneInputSchema = z.object({
  id: z.string().min(1, { message: "Id is required" }),
});

export const GetManyInputSchema = z.object({
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().nullish(),
  memberId: z.string().nullish(),
});

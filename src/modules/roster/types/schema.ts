import { z } from "zod";

import {
  DEFAULT_PAGE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from "@/modules/roster/server/procedures/get-many/params";

export const GetMemberInputSchema = z.object({
  id: z.string().min(1, { message: "Member ID is required" }),
});

export const GetMembersInputSchema = z.object({
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().nullish(),
  memberId: z.string().nullish(),
});

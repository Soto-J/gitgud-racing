import z from "zod";

import {
  DEFAULT_PAGE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from "@/constants";

export const ProfileInsertSchema = z.object({
  team: z.string(),
  isActive: z.boolean(),
  role: z.string(),
});

export const GetUserInputSchema = z.object({
  userId: z.string(),
});

export const GetUsersInputSchema = z.object({
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().nullish(),
  memberId: z.string().nullish(),
});

export const ProfileEditUserInputSchema = ProfileInsertSchema.extend({
  userId: z.string().min(1, { message: "Id is required" }),
});

export const DeleteUserInputSchema = z.object({
  userId: z.string(),
});

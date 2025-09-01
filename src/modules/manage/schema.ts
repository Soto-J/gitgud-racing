import z from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/modules/manage/constants";

// =============================================================================
// USER MANAGEMENT SCHEMAS
// =============================================================================

export const UpdateUserProfileInputSchema = z.object({
  team: z.string(),
  isActive: z.boolean(),
  role: z.enum(["admin", "staff", "member"]),
});

export const UpdateUserInputSchema = UpdateUserProfileInputSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export const GetUserInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
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

export const DeleteUserInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});
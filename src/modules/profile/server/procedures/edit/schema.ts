import z from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export const ProfileUpdateDataSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  iRacingId: z.string(),
  discord: z.string(),
  bio: z.string(),
});

export const UpdateProfileInputSchema = ProfileUpdateDataSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateDataSchema>;

export type UpdateProfileResult = inferRouterOutputs<AppRouter>["profile"]["edit"];
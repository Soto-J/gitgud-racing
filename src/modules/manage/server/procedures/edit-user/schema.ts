import z from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export const UpdateUserProfileInputSchema = z.object({
  team: z.string(),
  isActive: z.boolean(),
  role: z.enum(["admin", "staff", "user", "guest"]),
});

export const UpdateUserInputSchema = UpdateUserProfileInputSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

export type EditUserResult = inferRouterOutputs<AppRouter>["manage"]["editUser"];
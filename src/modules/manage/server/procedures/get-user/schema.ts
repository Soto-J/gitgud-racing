import z from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export const GetUserInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export type GetUserInput = z.infer<typeof GetUserInputSchema>;

export type ManageUser = inferRouterOutputs<AppRouter>["manage"]["getUser"];

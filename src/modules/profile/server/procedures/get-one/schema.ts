import z from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export const GetProfileInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export type GetProfileInput = z.infer<typeof GetProfileInputSchema>;

export type ProfileData = inferRouterOutputs<AppRouter>["profile"]["getOne"];
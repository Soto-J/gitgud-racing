import z from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export const CreateProfileInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;

export type CreateProfileResult = inferRouterOutputs<AppRouter>["profile"]["create"];
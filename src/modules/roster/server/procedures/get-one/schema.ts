import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export const GetMemberInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export type User = inferRouterOutputs<AppRouter>["members"]["getOne"];

import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { BanUserInputSchema } from "./schema";

export type BanUserInput = z.infer<typeof BanUserInputSchema>;

export type BanUserResult = inferRouterOutputs<AppRouter>["roster"]["banUser"];

import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { ProfileGetOneInputSchema } from "./schema";

export type ProfileGetOne = inferRouterOutputs<AppRouter>["profile"]["getOne"];
export type ProfileGetOneInput = z.infer<typeof ProfileGetOneInputSchema>;

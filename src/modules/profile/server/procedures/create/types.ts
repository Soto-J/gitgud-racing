import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { CreateProfileInputSchema } from "./schema";

export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;

export type CreateProfileResult =
  inferRouterOutputs<AppRouter>["profile"]["create"];

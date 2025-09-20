import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { UpdateUserInputSchema } from "./schema";

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

export type EditUserResult =
  inferRouterOutputs<AppRouter>["manage"]["editUser"];

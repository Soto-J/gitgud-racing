import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { EditUserInputSchema } from "./schema";

export type EditUserInput = z.infer<typeof EditUserInputSchema>;

export type EditUserResult =
  inferRouterOutputs<AppRouter>["roster"]["editUser"];

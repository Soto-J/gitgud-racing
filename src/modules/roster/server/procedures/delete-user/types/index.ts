import { z } from "zod";
import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

import { DeleteUserInputSchema } from "./schema";

export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

export type DeleteUserResult =
  inferRouterOutputs<AppRouter>["roster"]["deleteUser"];

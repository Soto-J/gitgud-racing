import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { ProfileSchema } from "./schema";

export type ProfileUpdateData = z.infer<typeof ProfileSchema>;

export type UpdateProfileResult =
  inferRouterOutputs<AppRouter>["profile"]["edit"];

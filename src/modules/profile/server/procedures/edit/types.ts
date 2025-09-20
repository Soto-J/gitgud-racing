import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { ProfileSchema, ProfileUpdateSchema } from "./schema";

export type UpdateProfileInput = z.infer<typeof ProfileUpdateSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileSchema>;

export type UpdateProfileResult =
  inferRouterOutputs<AppRouter>["profile"]["edit"];

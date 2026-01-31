import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type SeriesResults =
  inferRouterOutputs<AppRouter>["seriesResults"]["SeriesResults"];

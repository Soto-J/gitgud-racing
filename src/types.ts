import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type LicenseGetUser =
  inferRouterOutputs<AppRouter>["iracing"]["getUser"];

export type IracingLicense = {
  category: string;
  group_name: string;
  irating: number;
  safety_rating: string;
};

import { license } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type user = {
  id: string;
  name: string;
  email: string;
};
type Profile = {
  id: string;
  iracingId: string | null;
  discord: string | null;
  team: string | null;
  bio: string | null;
  isActive: boolean;
};

// Input
export type DrizzleRawUsereData = {
  user: user;
  profile: Profile;
  licenses: InferSelectModel<typeof license> | null;
};

// Output
export type LicenseDiscipline = {
  category: "Oval" | "Sports" | "Formula" | "Dirt Oval" | "Dirt Road";
  iRating: number | null;
  safetyRating: string | null;
  licenseClass: string;
};

export type GetUserResponse = {
  user: user;
  profile: Profile;
  licenses: {
    id: string;

    disciplines: LicenseDiscipline[];
  } | null;
};

import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type UserGetOne = inferRouterOutputs<AppRouter>["iracing"]["getUser"];

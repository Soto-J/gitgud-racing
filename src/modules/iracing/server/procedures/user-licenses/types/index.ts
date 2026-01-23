import { z } from "zod";

import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

import {
  LicenseClassSchema,
  LicenseDisciplineSchema,
  LicenseSchema,
  TransformLicenseDataSchema,
  LicensesResponseSchema,
} from "./schema";

export type UserLicenses =
  inferRouterOutputs<AppRouter>["iracing"]["userLicenses"];

export type LicensesResponse = z.infer<typeof LicensesResponseSchema>;

export type LicenseType = z.infer<typeof LicenseSchema>;

export type LicenseClass = z.infer<typeof LicenseClassSchema>;

export type LicenseDiscipline = z.infer<typeof LicenseDisciplineSchema>;

export type TransformLicenseData = z.infer<typeof TransformLicenseDataSchema>;

import { z } from "zod";

import {
  HelmetSchema,
  LicenseSchema,
} from "@/lib/iracing/member/get/types/schema";

export const TokenRespnseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  refresh_token: z.string(),
  expires_in: z.number(),
  refresh_token_expires_in: z.number(),
  scope: z.literal("iracing.auth iracing.profile"),
});

export const TokenResponseErrorSchema = z.union([
  z.literal("TOKEN_EXPIRED"),
  z.literal("UNAUTHORIZED"),
  z.literal("UPSTREAM_ERROR"),
  z.literal("RATE_LIMITED"),
]);

const PackageSchema = z.array(
  z.object({
    package_id: z.number(),
    content_ids: z.array(z.number()),
  }),
);

export const IracingUserInfoSchema = z.object({
  cust_id: z.number(),
  display_name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  on_car_name: z.string(),
  member_since: z.string(),
  flair_id: z.number(),
  flair_name: z.string(),
  flair_shortname: z.string(),
  flair_country_code: z.string(),
  last_login: z.string(),
  read_tc: z.string(),
  read_pp: z.string(),
  read_comp_rules: z.string(),
  flags: z.number(),
  connection_type: z.string(),
  download_server: z.string(),

  account: z.object({
    ir_dollars: z.number(),
    ir_credits: z.number(),
    status: z.string(),
    country_rules: z.null(),
  }),

  helmet: HelmetSchema,
  suit: z.object({
    pattern: z.number(),
    color1: z.string(),
    color2: z.string(),
    color3: z.string(),
    body_type: z.number(),
  }),

  licenses: z.object({
    oval: LicenseSchema,
    sports_car: LicenseSchema,
    formula_car: LicenseSchema,
    dirt_oval: LicenseSchema,
    dirt_road: LicenseSchema,
  }),

  car_packages: PackageSchema,
  track_packages: PackageSchema,
  other_owned_packages: z.array(z.number()),
  dev: z.boolean(),
  alpha_tester: z.boolean(),
  rain_tester: z.boolean(),
  broadcaster: z.boolean(),
  restrictions: z.looseObject({}),
  has_read_comp_rules: z.boolean(),
  has_read_nda: z.boolean(),
  flags_hex: z.string(),
  hundred_pct_club: z.boolean(),
  twenty_pct_discount: z.boolean(),
  last_season: z.number(),
  has_additional_content: z.boolean(),
  has_read_tc: z.boolean(),
  has_read_pp: z.boolean(),
});

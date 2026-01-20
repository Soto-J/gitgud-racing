import { UserRole } from "@/db/schemas/type";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const ROUTES = [
  "home",
  "series_stats",
  "schedule",
  "profile",
  "roster",
  "teams",
  "manage",
] as const;
export type RouteKey = (typeof ROUTES)[number];

export const ROUTE_ACCESS: Record<UserRole, readonly RouteKey[]> = {
  guest: ["home", "series_stats"],
  user: ["home", "series_stats", "schedule", "profile", "roster", "teams"],
  staff: ROUTES,
  admin: ROUTES,
} as const;

const statement = { ...defaultStatements, routes: ROUTES } as const;

export const ac = createAccessControl(statement);

export const roles = {
  guest: ac.newRole({ routes: ["home", "series_stats"] }),
  user: ac.newRole({
    routes: ["home", "series_stats", "schedule", "profile", "roster", "teams"],
  }),
  staff: ac.newRole({
    ...adminAc.statements,
    routes: [
      "home",
      "series_stats",
      "schedule",
      "profile",
      "roster",
      "teams",
      "manage",
    ],
  }),
  admin: ac.newRole({
    ...adminAc.statements,
    routes: [
      "home",
      "series_stats",
      "schedule",
      "profile",
      "roster",
      "teams",
      "manage",
    ],
  }),
} as const;

export type RouteRole = keyof typeof roles;
export type NavRoutes = (typeof statement.routes)[number];

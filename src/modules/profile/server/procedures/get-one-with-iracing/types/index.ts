import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type ProfileGetOneWithIracing =
  inferRouterOutputs<AppRouter>["profile"]["getOneWithIracing"];

export type TransformedLicense = {
  categoryId: number;
  category: string;
  categoryName: string;
  licenseLevel: number;
  licenseClass: string;
  safetyRating: number;
  cpi: number;
  irating: number | null | undefined;
  ttRating: number;
  mprNumRaces: number;
  mprNumTts: number;
  color: string;
  groupName: string;
  groupId: number;
  proPromotable: boolean;
  seq: number;
  categoryImageSrc: string;
};

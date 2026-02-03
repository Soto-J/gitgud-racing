import { z } from "zod";

import {
  MemberGetInputSchema,
  MemberGetResponseSchema,
  LicenseSchema,
} from "./schema";

export type MemberGetInput = z.infer<typeof MemberGetInputSchema>;
export type MemberGetResponse = z.infer<typeof MemberGetResponseSchema>;
export type License = z.infer<typeof LicenseSchema>;

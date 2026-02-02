import { z } from "zod";

import { MemberRecentRacesResponseSchema } from "./schemas";

export type MemberRecentRacesResponse = z.infer<
  typeof MemberRecentRacesResponseSchema
>;

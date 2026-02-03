import { z } from "zod";

import { MemberRecentRacesResponseSchema } from "./schema";

export type MemberRecentRacesResponse = z.infer<
  typeof MemberRecentRacesResponseSchema
>;

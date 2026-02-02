import { z } from "zod";

import { MemberSummaryResponseSchema } from "./schemas";

export type MemberSummaryResponse = z.infer<typeof MemberSummaryResponseSchema>;

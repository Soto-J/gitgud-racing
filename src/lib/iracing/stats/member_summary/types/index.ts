import { z } from "zod";

import { MemberSummaryResponseSchema } from "./schema";

export type MemberSummaryResponse = z.infer<typeof MemberSummaryResponseSchema>;

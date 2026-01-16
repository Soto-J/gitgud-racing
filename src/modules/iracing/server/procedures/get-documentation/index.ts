import { iracingProcedure } from "@/trpc/init";
import { fetchIracingData } from "../../api";

export const getDocumentationProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    return await fetchIracingData(`/data/doc`, ctx.iracingAccessToken);
  },
);

import { createTRPCRouter } from "@/trpc/init";

import { getManyProcedure } from "./get-many";


export const iracingScheduleRouter = createTRPCRouter({
    getMany: getManyProcedure
});

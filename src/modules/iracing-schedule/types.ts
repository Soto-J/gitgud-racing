import type { z } from "zod";
import type { SeriesSeasonListSchema } from "@/lib/iracing/series/season_list/types/schema";

export type Season = z.infer<typeof SeriesSeasonListSchema>["seasons"][number];

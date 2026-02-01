import { ChunkResponse, SeriesResult } from "../series-results/types";

export function groupSessionsBySeries(sessions: ChunkResponse) {
  return sessions.reduce(
    (acc, session) => {
      if (!acc[session.series_id]) {
        acc[session.series_id] = [];
      }
      acc[session.series_id].push(session);
      return acc;
    },
    {} as Record<number, SeriesResult[]>,
  );
}

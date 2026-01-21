"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function QuickStatsCard() {
  const trpc = useTRPC();
  const { data, isLoading, isError, error } = useQuery(
    trpc.iracing.getUserSummary.queryOptions(),
  );

  if (!data || isError) {
    console.log({ error });
    return null;
  }

  if (isLoading) {
    return <div>Loading..</div>;
  }

  const { this_year: thisYear, cust_id: custId } = data;

  const winRate =
    thisYear?.num_official_sessions > 0
      ? (
          (thisYear.num_official_wins / thisYear.num_official_sessions) *
          100
        ).toFixed(1)
      : "0.0";

  const currentYear = new Date().getFullYear();

  return (
    <div className="border-secondary/20 from-secondary/60 to-secondary/20 mt-6 rounded-xl border bg-gradient-to-br p-4 shadow-sm backdrop-blur-sm">
      <h4 className="text-foreground mb-1 text-sm font-semibold">
        Quick Stats - {currentYear}
      </h4>

      <p className="text-foreground mb-3 text-xs">ID: {custId}</p>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-foreground/80 font-medium">
            Official Sessions
          </span>
          <span className="text-accent-foreground font-bold">
            {thisYear?.num_official_sessions || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-foreground/80 font-medium">
            League Sessions
          </span>
          <span className="text-accent-foreground font-bold">
            {thisYear?.num_league_sessions || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-foreground/80 font-medium">Official Wins</span>
          <span className="text-accent-foreground font-bold">
            {thisYear?.num_official_wins || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-foreground/80 font-medium">League Wins</span>
          <span className="text-accent-foreground font-bold">
            {thisYear?.num_league_wins || 0}
          </span>
        </div>

        <div className="border-secondary/20 flex justify-between border-t pt-2">
          <span className="text-foreground font-medium">Win Rate</span>
          <span className="text-accent-foreground font-bold">{winRate}%</span>
        </div>
      </div>
    </div>
  );
}

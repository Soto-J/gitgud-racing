import { IRacingUserSummary } from "@/modules/iracing/types";

interface QuickStatsCardProps {
  summaryData: IRacingUserSummary;
}

export const QuickStatsCard = ({ summaryData }: QuickStatsCardProps) => {
  if (!summaryData) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const { this_year: thisYear } = summaryData;

  const winRate =
    thisYear?.num_official_sessions > 0
      ? (
          (thisYear.num_official_wins / thisYear.num_official_sessions) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="border-secondary/20 from-secondary/60 to-secondary/20 mt-6 rounded-xl border bg-gradient-to-br p-4 shadow-sm backdrop-blur-sm">
      <h4 className="text-foreground mb-1 text-sm font-semibold">
        Quick Stats - {currentYear}
      </h4>

      <p className="text-foreground mb-3 text-xs">ID: {summaryData.cust_id}</p>

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
};

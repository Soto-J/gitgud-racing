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
    thisYear.num_official_sessions > 0
      ? (
          (thisYear.num_official_wins / thisYear.num_official_sessions) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="mt-6 rounded-xl border border-red-700/30 bg-gradient-to-br from-red-900/30 to-red-800/30 p-4 backdrop-blur-sm">
      <h4 className="mb-1 text-sm font-semibold text-red-200">
        {currentYear} Stats
      </h4>
      <p className="mb-3 text-xs text-gray-400">ID: {summaryData.cust_id}</p>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-gray-300">
          <span>Official Sessions</span>
          <span className="font-semibold text-blue-300">
            {thisYear.num_official_sessions}
          </span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>League Sessions</span>
          <span className="font-semibold text-purple-300">
            {thisYear.num_league_sessions}
          </span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Official Wins</span>
          <span className="font-semibold text-green-400">
            {thisYear.num_official_wins}
          </span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>League Wins</span>
          <span className="font-semibold text-green-300">
            {thisYear.num_league_wins}
          </span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Win Rate</span>
          <span className="font-semibold text-yellow-300">{winRate}%</span>
        </div>
      </div>
    </div>
  );
};

export const QuickStatsCard = () => {
  return (
    <div className="mt-6 rounded-xl border border-red-700/30 bg-gradient-to-br from-red-900/30 to-red-800/30 p-4 backdrop-blur-sm">
      <h4 className="mb-3 text-sm font-semibold text-red-200">Quick Stats</h4>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-gray-300">
          <span>iRating</span>
          <span className="font-semibold text-red-300">2,847</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Safety</span>
          <span className="font-semibold text-green-400">A 4.23</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Races</span>
          <span className="font-semibold text-blue-300">142</span>
        </div>
      </div>
    </div>
  );
};

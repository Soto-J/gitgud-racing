import { Shield, Trophy, Users } from "lucide-react";

export const AchievementBadges = () => {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-5 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]"></div>
          <div className="relative flex items-center gap-2 text-yellow-900">
            <Trophy size={18} className="drop-shadow-sm" />
            <span className="text-sm font-bold tracking-wide">Top 1000 iRating</span>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-5 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]"></div>
          <div className="relative flex items-center gap-2 text-green-900">
            <Shield size={18} className="drop-shadow-sm" />
            <span className="text-sm font-bold tracking-wide">Class A License</span>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-5 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]"></div>
          <div className="relative flex items-center gap-2 text-red-900">
            <Users size={18} className="drop-shadow-sm" />
            <span className="text-sm font-bold tracking-wide">Team Member</span>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 px-5 py-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]"></div>
          <div className="relative flex items-center gap-2 text-blue-900">
            <Trophy size={18} className="drop-shadow-sm" />
            <span className="text-sm font-bold tracking-wide">Race Winner</span>
          </div>
        </div>
      </div>
    </div>
  );
};

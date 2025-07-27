import { Shield, Trophy, Users } from "lucide-react";

export const AchievementBadges = () => {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 text-sm font-semibold text-yellow-900 shadow-lg">
        <Trophy size={16} />
        Top 1000 iRating
      </div>
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 px-4 py-2 text-sm font-semibold text-green-900 shadow-lg">
        <Shield size={16} />
        Class A License
      </div>
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-400 to-red-500 px-4 py-2 text-sm font-semibold text-red-900 shadow-lg">
        <Users size={16} />
        Team Member
      </div>
    </div>
  );
};

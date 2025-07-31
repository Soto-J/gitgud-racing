import { cn } from "@/lib/utils";

import { AchievementBadges } from "@/modules/profile/ui/components/achievement-badges";

import {
  User,
  Trophy,
  Shield,
  Users,
  MessageCircle,
  Edit3,
} from "lucide-react";

import { StatCard } from "./stat-card";
import { ProfileGetOne } from "@/modules/profile/types";

const classColors = {
  A: "bg-red-500",
  B: "bg-green-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  R: "bg-red-500",
};

interface ProfileCardProps {
  profile: ProfileGetOne;
  onEdit?: () => void;
}

export const ProfileCard = ({ profile, onEdit }: ProfileCardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-red-50 p-4 md:px-8">
      {/* Profile Banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-red-700 shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
                Racing Profile
              </h1>
              <p className="text-lg text-red-200">iRacing Series</p>
            </div>

            <div className="hidden md:block">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Trophy className="h-12 w-12 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <h2 className="mb-2 text-3xl font-bold md:text-4xl">
                  {profile.memberName || ""}
                  {profile.iracingId && (
                    <span className="ml-3 text-xl font-normal text-red-200">
                      #{profile.iracingId}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-red-100">
                  <User size={16} />
                  <span>Professional Driver</span>
                </div>
              </div>
              {/* Edit button */}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="group relative flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
                >
                  <Edit3 size={18} />
                  <span>Edit</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-8">
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Trophy} label="iRating" value={profile.iRating} />

              <StatCard
                icon={Shield}
                label="Safety Rating"
                value={
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-2 py-1 text-sm font-bold text-white",
                        classColors[
                          profile.safetyClass as keyof typeof classColors
                        ],
                      )}
                    >
                      {profile.safetyClass}
                    </span>
                    <span>{profile.safetyRating}</span>
                  </div>
                }
              />

              <StatCard icon={Users} label="Team" value={profile.team ?? "—"} />

              <StatCard
                icon={MessageCircle}
                label="Discord"
                value={profile.discord ?? "—"}
              />
            </div>

            {/* Bio Section */}
            <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-red-50 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                <User className="text-red-600" size={24} />
                Driver Bio
              </h3>
              <div className="prose max-w-none">
                {profile.bio ? (
                  <p className="text-lg leading-relaxed text-gray-700">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-lg text-gray-400 italic">
                    No bio provided.
                  </p>
                )}
              </div>
            </div>

            <AchievementBadges />
          </div>
        </div>
      </div>
    </div>
  );
};

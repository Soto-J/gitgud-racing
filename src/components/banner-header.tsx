import { Edit3, Shield, Trophy, User } from "lucide-react";

import { ComponentType } from "react";

interface BannerHeaderProps {
  section: string;
  icon?: ComponentType<{ className?: string }>;
  iconColor?: string;
  title: string;
  subTitle1: string;
  subTitle2: string;
  onEdit?: () => void;
}

export const BannerHeader = ({
  section,
  subTitle1,
  subTitle2,
  icon: Icon,
  title,
  onEdit,
}: BannerHeaderProps) => {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 rotate-12 transform">
            <Trophy size={120} className="text-yellow-300" />
          </div>
          <div className="absolute right-32 bottom-8 -rotate-12 transform">
            <Shield size={80} className="text-white" />
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Profile Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
              <Trophy className="text-red-700" size={40} />
            </div>

            {/* Driver Details */}
            <div className="text-white">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-sm font-medium tracking-wider text-red-200 uppercase">
                  {section}
                </h1>
                <div className="h-1 w-8 rounded-full bg-yellow-400"></div>
              </div>

              <h2 className="mb-3 text-4xl font-bold md:text-5xl">{title}</h2>

              <div className="flex items-center gap-4 text-red-100">
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span className="font-medium">{subTitle1}</span>
                </div>
                <div className="h-4 w-px bg-red-300"></div>
                <div className="flex items-center gap-2">
                  <Shield size={18} />
                  <span className="font-medium">{subTitle2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="group relative flex transform items-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl"
            >
              <Edit3 size={20} />
              <span className="text-lg">Edit Profile</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

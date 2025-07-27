import { Trophy } from "lucide-react";

export const ProfileBanner = () => (
  <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-red-900 via-red-800 to-red-700 shadow-2xl">
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    <div className="relative px-8 py-12 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
            Racing Profile
          </h1>
          <p className="text-lg text-red-200">iRacing Championship Series</p>
        </div>
        <div className="hidden md:block">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Trophy className="h-12 w-12 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

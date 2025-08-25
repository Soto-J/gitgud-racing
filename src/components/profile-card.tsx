import {
  User,
  Trophy,
  Users,
  MessageCircle,
  Car,
  Mountain,
  CircleDot,
  Zap,
  Truck,
} from "lucide-react";

import { DisciplineCard } from "./discipline-card";
import { InfoCard } from "./info-card";
import { UserGetOne } from "@/modules/iracing/types";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  data: UserGetOne["member"];
}

// Icon mapping for racing disciplines
const getDisciplineIcon = (category: string) => {
  const iconMap = {
    Oval: CircleDot,
    Sports: Car,
    Formula: Zap,
    "Dirt Oval": Mountain,
    "Dirt Road": Truck,
  };

  return iconMap[category as keyof typeof iconMap] || Car;
};

export const ProfileCard = ({ data }: ProfileCardProps) => {
  const disciplines = data.licenses?.disciplines
    ? data.licenses.disciplines
    : [
        {
          category: "Oval" as const,
          iRating: null,
          safetyRating: null,
          licenseClass: "R",
        },
        {
          category: "Sports" as const,
          iRating: null,
          safetyRating: null,
          licenseClass: "R",
        },
        {
          category: "Formula" as const,
          iRating: null,
          safetyRating: null,
          licenseClass: "R",
        },
        {
          category: "Dirt Oval" as const,
          iRating: null,
          safetyRating: null,
          licenseClass: "R",
        },
        {
          category: "Dirt Road" as const,
          iRating: null,
          safetyRating: null,
          licenseClass: "R",
        },
      ];

  return (
    <div className="space-y-10 py-8">
      {/* Racing Disciplines Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Racing Disciplines
              </h2>
              <p className="text-gray-600">
                License classes and performance metrics
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg bg-red-50 px-3 py-2 sm:flex">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-700">
              Active Driver
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
          {disciplines.map((val, idx) => (
            <div
              key={val.category}
              className={cn(
                "transition-all duration-300 hover:scale-[1.02]",
                idx <= 2 ? "lg:col-span-2" : "",
                idx === 3 ? "lg:col-span-2 lg:col-start-2" : "",
                idx === 4 ? "lg:col-span-2 lg:col-start-4" : "",
              )}
            >
              <DisciplineCard
                title={val.category}
                icon={getDisciplineIcon(val.category)}
                iRating={val.iRating || 0}
                licenseClass={val.licenseClass}
                safetyRating={val.safetyRating || "0.0"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Driver Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Driver Information
            </h2>
            <p className="text-gray-600">
              Contact details and team affiliation
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoCard
              icon={Users}
              label="Team"
              value={data.profile.team || "N/a"}
              accentColor="bg-purple-600"
            />

            <InfoCard
              icon={MessageCircle}
              label="Discord"
              value={data.profile.discord || ""}
              accentColor="bg-indigo-600"
            />
          </div>

          {/* Enhanced Bio Section */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm">
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-gray-100 opacity-20"></div>
            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Driver Bio</h3>
              </div>
              <div className="prose max-w-none">
                {data.profile.bio ? (
                  <div className="rounded-lg border border-gray-100 bg-white p-4">
                    <p className="leading-relaxed text-gray-700">
                      {data.profile.bio}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-gray-500 italic">
                      No bio provided yet. Share your racing story!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

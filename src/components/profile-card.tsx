import {
  User,
  Trophy,
  Shield,
  Users,
  MessageCircle,
  Car,
  Mountain,
} from "lucide-react";

import { DisciplineCard } from "./discipline-card";
import { InfoCard } from "./info-card";
import { UserGetOne } from "@/modules/iracing/types";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  data: UserGetOne["data"];
}

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
    <div className="space-y-12 py-12">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Racing Disciplines</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
          {disciplines.map((val, idx) => (
            <div
              key={val.category}
              className={cn(
                idx <= 2 ? "lg:col-span-2" : "",
                idx === 3 ? "lg:col-span-2 lg:col-start-2" : "",
                idx === 4 ? "lg:col-span-2 lg:col-start-4" : "",
              )}
            >
              <DisciplineCard
                title={val.category}
                icon={Car}
                iRating={val.iRating || 0}
                licenseClass={val.licenseClass}
                safetyRating={val.safetyRating || "0.0"}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Driver Information</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        {/* Bio Section */}
        <div className="rounded-xl border-2 border-gray-200 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <User className="text-red-600" size={24} />
            Driver Bio
          </h3>
          <div className="prose max-w-none">
            {data.profile.bio ? (
              <p className="text-lg leading-relaxed text-gray-700">
                {data.profile.bio}
              </p>
            ) : (
              <p className="text-lg text-gray-400 italic">No bio provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

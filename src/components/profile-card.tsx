import {
  User,
  Trophy,
  Shield,
  Users,
  MessageCircle,
  Car,
  Mountain,
} from "lucide-react";

import { CategoryCard } from "./category-card";
import { BannerHeader } from "./banner-header";
import { InfoCard } from "./info-card";
import { UserGetOne } from "@/modules/iracing/types";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  data: UserGetOne["data"];
  onEdit?: () => void;
}

export const ProfileCard = ({ data, onEdit }: ProfileCardProps) => {
  console.log("data", data);
  const disciplines = data.licenses?.disciplines || [];

  return (
    <div className="min-h-svh bg-gradient-to-br from-gray-100 via-gray-50 to-red-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <BannerHeader
          section="iRacing Profile"
          title={data.user?.name || ""}
          subTitle1="Profesional Driver"
          subTitle2="Active Member"
          onEdit={onEdit}
        />

        {/* Racing Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Racing Disciplines
          </h2>

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
                <CategoryCard
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

        {/* Additional Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Driver Information
          </h2>

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
          <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-red-50 p-6">
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
    </div>
  );
};

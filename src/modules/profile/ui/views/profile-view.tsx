"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Trophy, Shield, Users, MessageCircle, User } from "lucide-react";

import { StatCard } from "@/modules/profile/ui/components/stat-card";
import { ProfileBanner } from "@/modules/profile/ui/components/profile-banner";
import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";
import { EditProfileButton } from "@/modules/profile/ui/components/edit-profile-button";
import { AchievementBadges } from "@/modules/profile/ui/components/achievement-badges";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

const classColors = {
  A: "bg-red-500",
  B: "bg-green-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  R: "bg-red-500",
};

interface ProfileViewProps {
  userId: string;
}

export const ProfileView = ({ userId }: ProfileViewProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getOne.queryOptions({ userId }),
  );

  const queryClient = useQueryClient();

  const createProfile = useMutation(
    trpc.profile.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.profile.getOne.queryOptions({ userId }),
        );
        toast.success("Profile created");
      },
      onError: (error) => {
        console.error(error.message);
        toast.error("Could not create your profile");
      },
    }),
  );

  if (!profile) {
    createProfile.mutate({ userId });
  }

  return (
    <>
      <EditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={profile}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-red-50 p-4 md:px-8">
        <ProfileBanner />

        {/* Main Profile Card */}
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <h2 className="mb-2 text-3xl font-bold md:text-4xl">
                    {profile.memberName}
                    {profile?.iracingId && (
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
                <EditProfileButton onEdit={() => setOpenDialog(true)} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-8">
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={Trophy}
                  label="iRating"
                  value={profile.iRating}
                />

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

                <StatCard
                  icon={Users}
                  label="Team"
                  value={profile.team ?? "—"}
                />

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
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProdileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

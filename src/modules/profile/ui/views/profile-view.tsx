"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";

import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";

import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import Banner from "@/components/banner";
import Profile from "@/components/profile";

interface ProfileViewProps {
  userId: string;
}

export const ProfileView = ({ userId }: ProfileViewProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const trpc = useTRPC();
  const [profile, iracingPayload, chart] = useSuspenseQueries({
    queries: [
      trpc.profile.getOne.queryOptions({ userId }),
      trpc.iracing.userLicenses.queryOptions({ userId }),
      trpc.iracing.userChartData.queryOptions({ userId }),
    ],
  });

  console.log("Data: ", {
    profile: profile.data,
    licenses: iracingPayload.data.licenses,
    // userChartData: chartPayload.data,
  });
  return (
    <>
      <EditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={profile.data}
      />

      {/* <Banner
        section="iRacing profile"
        title={userPayload.data?.user?.name || ""}
        subTitle1="Professional Driver"
        subTitle2={userPayload.data?.profile?.isActive ? "Active" : "Inactive"}
        onEdit={() => setOpenDialog(true)}
      /> */}

      <Profile
        profile={profile.data}
        iracingPayload={iracingPayload.data}
        chartData={{}}
      />
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

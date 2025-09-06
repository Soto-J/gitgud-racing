"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";

import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Banner } from "@/components/banner";

import { DriverProfile } from "@/components/profile-card/driver-profile";

interface ProfileViewProps {
  userId: string;
}

export const ProfileView = ({ userId }: ProfileViewProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const trpc = useTRPC();
  const [userPayload, chartPayload] = useSuspenseQueries({
    queries: [
      trpc.iracing.getUser.queryOptions({ userId }, { retry: false }),
      trpc.iracing.userChartData.queryOptions({ userId }),
    ],
  });
  return (
    <>
      <EditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={userPayload.data}
      />

      <Banner
        section="iRacing profile"
        title={userPayload.data?.user.name || ""}
        subTitle1="Professional driver"
        subTitle2={userPayload.data?.profile?.isActive ? "Active" : "Inactive"}
        onEdit={() => setOpenDialog(true)}
      />

      <DriverProfile member={userPayload.data} chartData={chartPayload.data} />
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

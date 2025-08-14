"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ProfileCard } from "@/components/profile-card";
import { Banner } from "@/components/banner";

interface ProfileViewProps {
  userId: string;
}

export const ProfileView = ({ userId }: ProfileViewProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.iracing.getUser.queryOptions({ userId }, { retry: false }),
  );

  return (
    <>
      <EditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={data?.member}
      />

      <Banner
        section="iRacing profile"
        title={data.member.user?.name || ""}
        subTitle1="Professional driver"
        subTitle2={data.member.profile.isActive ? "Active" : "Inactive"}
        onEdit={() => setOpenDialog(true)}
      />

      <ProfileCard data={data?.member} />
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ProfileCard } from "@/components/profile-card";

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
        initialValues={data?.data}
      />

      <ProfileCard data={data?.data} onEdit={() => setOpenDialog(true)} />
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

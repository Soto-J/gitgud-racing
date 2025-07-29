"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { toast } from "sonner";

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

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getOneOrCreate.queryOptions({ userId }),
  );

  // const queryClient = useQueryClient();

  // const createProfile = useMutation(
  //   trpc.profile.create.mutationOptions({
  //     onSuccess: () => {
  //       queryClient.invalidateQueries(
  //         trpc.profile.getOne.queryOptions({ userId }),
  //       );
  //       toast.success("Profile created");
  //     },
  //     onError: (error) => {
  //       console.error(error.message);
  //       toast.error("Could not create your profile");
  //     },
  //   }),
  // );

  // if (!profile) {
  //   createProfile.mutate({ userId });
  // }

  return (
    <>
      <EditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={profile}
      />

      <ProfileCard profile={profile} onEdit={() => setOpenDialog(true)} />
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

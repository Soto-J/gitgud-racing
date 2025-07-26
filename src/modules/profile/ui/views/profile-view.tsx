"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";
import { EditProfileButton } from "@/modules/profile/ui/components/edit-profile-button";

interface ProfileViewProps {
  userId: string;
}
export const ProfileView = ({ userId }: ProfileViewProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const quereyClient = useQueryClient();
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getOne.queryOptions({ userId }),
  );

  if (!profile) {
    useMutation(
      trpc.profile.create.mutationOptions({
        onSuccess: () => {
          quereyClient.invalidateQueries(
            trpc.profile.getOne.queryOptions({ userId }),
          );
        },
        onError: (error) => {
          console.log(error.message);
        },
      }),
    ).mutate({ userId });
  }

  return (
    <>
      <EditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={profile}
      />

      <div className="gap-y-4 p-4 md:px-8">
        <div className="flex justify-between space-y-5 rounded-lg border bg-white px-4 py-5 shadow">
          <div className="space-y-5 px-4 py-5">
            <h2 className="text-2xl font-medium">{profile.memberName}</h2>

            <div className="space-y-4">
              <p className="font-medium">Irating</p>
              <p className="font-medium">Srating</p>
              <p className="font-medium">Team</p>
              <p className="font-medium">Bio</p>
              <p className="text-neutral-800">someshit</p>
            </div>
          </div>

          <div className="mt-4 mr-4">
            <EditProfileButton onEdit={() => setOpenDialog(true)} />
          </div>
        </div>
      </div>
    </>
  );
};

"use client";

import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { EditProfileForm } from "@/modules/profile/ui/components/edit-profile-form";

import { EditProfileButton } from "@/modules/profile/ui/components/edit-profile-button";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";

interface ProfileViewProps {
  userId: string;
}
export const ProfileView = ({ userId }: ProfileViewProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.profile.getOne.queryOptions({ userId }),
  );

  if (!data) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Button onClick={() => setOpenDialog(true)}>
          Complete your profile
        </Button>
        
        <ResponsiveDialog
          title="Profile"
          description="Edit your profile"
          isOpen={openDialog}
          onOpenChange={() => setOpenDialog(false)}
        >
          <EditProfileForm />
        </ResponsiveDialog>
      </div>
    );
  }

  return (
    <>
      {/* <RemoveConfirmationDialog />
      <UpdateAgentDialog
        initialValues={data}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
      /> */}

      <div className="gap-y-4 p-4 md:px-8">
        <div className="flex justify-between space-y-5 rounded-lg border bg-white px-4 py-5 shadow">
          <div className="space-y-5 px-4 py-5">
            <h2 className="text-2xl font-medium">name</h2>

            <div className="space-y-4">
              <p className="font-medium">Irating</p>
              <p className="font-medium">Srating</p>
              <p className="font-medium">Team</p>
              <p className="font-medium">Bio</p>
              <p className="text-neutral-800">someshit</p>
            </div>
          </div>

          <div className="mt-4 mr-4">
            <EditProfileButton onEdit={() => {}} />
          </div>
        </div>
      </div>
    </>
  );
};

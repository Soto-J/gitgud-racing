"use client";

import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";

import { EditProfileDialog } from "@/modules/profile/ui/components/edit-profile-dialog";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Banner } from "@/components/banner";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IracingInfo } from "@/components/profile-card/iracing-info";
import { ContactInfo } from "../components/contact-info";
import { Profile } from "../components/profile";

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
        title={userPayload.data?.user?.name || ""}
        subTitle1="Professional Driver"
        subTitle2={userPayload.data?.profile?.isActive ? "Active" : "Inactive"}
        onEdit={() => setOpenDialog(true)}
      />

      <Profile iRacingInfo={chartPayload.data} contactInfo={userPayload.data} />
    </>
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);

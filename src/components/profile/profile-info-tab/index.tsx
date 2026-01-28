"use client";

import { Activity, useState } from "react";

import { Edit2, FileText, MailIcon, Users } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

import { authClient } from "@/lib/auth/auth-client";
import { ProfileGetOne } from "@/modules/profile/types";

import ProfileField from "@/components/profile/profile-info-tab/profile-field";
import EditProfileDialog from "@/modules/profile/ui/components/edit-profile-dialog";
import GeneratedAvatar from "@/components/generated-avatar";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileInfoTabProps {
  tabKey: string;
  profilePayload: ProfileGetOne;
}

export default function ProfileInfoTab({
  tabKey,
  profilePayload,
}: ProfileInfoTabProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const { data } = authClient.useSession();

  const isOwnProfile = profilePayload.userId === data?.user.id;

  return (
    <>
      <EditProfileDialog
        isOpen={dialogIsOpen}
        onCloseDialog={() => setDialogIsOpen(false)}
        initialValues={profilePayload}
      />

      <TabsContent value={tabKey}>
        <Card className="bg-card border-border relative overflow-hidden border shadow-2xl">
          <div className="from-primary via-secondary to-primary absolute top-0 left-0 h-1 w-full bg-gradient-to-r" />

          <CardHeader className="border-border relative flex border-b pb-6">
            <div className="absolute inset-0 bg-[repeating-conic-gradient(var(--foreground)_0_90deg,transparent_0_180deg)_0_0/20px_20px] opacity-[0.02]" />

            <div className="relative flex items-center gap-4">
              <div className="ring-primary/70 ring-offset-card rounded-xl ring-2 ring-offset-2">
                <GeneratedAvatar
                  seed={profilePayload.userName}
                  variant="botttsNeutral"
                  className="h-14 w-14 rounded-xl"
                />
              </div>

              <div>
                <CardTitle className="text-card-foreground text-2xl font-bold tracking-tight">
                  {profilePayload.userName}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="font-semibold">iRacing ID: </span>
                  <span className="font-medium">{profilePayload.custId}</span>
                </CardDescription>
              </div>
            </div>

            <Activity mode={isOwnProfile ? "visible" : "hidden"}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogIsOpen(true)}
                className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 z-10 ml-auto shrink-0"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Activity>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField
                icon={MailIcon}
                label="Email"
                value={profilePayload?.email || "No email provided"}
                iconBgColor="bg-indigo-600"
              />
              <ProfileField
                icon={Users}
                label="Team"
                value={profilePayload?.team || "No team assigned"}
                iconBgColor="bg-purple-600"
              />
              <ProfileField
                icon={FaDiscord}
                label="Discord"
                value={profilePayload?.discord || "No discord provided"}
                iconBgColor="bg-[#5865F2]"
              />
            </div>

            {/* Bio Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded">
                  <FileText className="text-primary h-4 w-4" />
                </div>
                <h3 className="text-card-foreground font-semibold">
                  Driver Bio
                </h3>
              </div>

              {profilePayload?.bio ? (
                <div className="border-border bg-muted/30 relative overflow-hidden rounded-xl border p-5">
                  <div className="from-primary to-secondary absolute top-0 left-0 h-full w-1 bg-gradient-to-b" />
                  <p className="text-muted-foreground pl-3 text-sm leading-relaxed">
                    {profilePayload.bio}
                  </p>
                </div>
              ) : (
                <div className="border-border bg-muted/20 rounded-xl border border-dashed p-8 text-center">
                  <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <FileText className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No bio provided yet. Share your racing story!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}

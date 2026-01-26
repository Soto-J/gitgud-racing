"use client";

import { Activity, useState } from "react";

import {
  Edit2,
  FileText,
  MailIcon,
  MessageCircle,
  User,
  Users,
} from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { ProfileGetOne } from "@/modules/profile/types";

import ProfileField from "@/components/profile/profile-info-tab/profile-field";
import EditProfileDialog from "@/modules/profile/ui/components/edit-profile-dialog";
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
        <Card className="border-border bg-background/20 rounded-2xl shadow-sm backdrop-blur-lg">
          <CardHeader className="border-border flex justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                {/* TODO add avatar */}
                <User className="h-6 w-6 text-white" />
              </div>

              <div>
                <CardTitle className="text-foreground text-2xl font-semibold">
                  {profilePayload.userName}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Contact details and team affiliation
                </CardDescription>
              </div>
            </div>

            <Activity mode={isOwnProfile ? "visible" : "hidden"}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogIsOpen(true)}
                className="shrink-0"
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
                icon={MessageCircle}
                label="Discord"
                value={profilePayload?.discord || "No discord provided"}
                iconBgColor="bg-indigo-600"
              />
            </div>

            {/* Bio Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-5 w-5" />
                <h3 className="text-foreground font-semibold">Driver Bio</h3>
              </div>

              {profilePayload?.bio ? (
                <div className="bg-muted/30 rounded-lg border p-4">
                  <p className="text-foreground text-sm leading-relaxed">
                    {profilePayload.bio}
                  </p>
                </div>
              ) : (
                <div className="bg-muted/20 rounded-lg border border-dashed p-6 text-center">
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

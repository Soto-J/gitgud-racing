import { MessageCircle, User, Users } from "lucide-react";

import InfoCard from "@/components/profile/personal-info-tab/info-card";
import { TabsContent } from "@/components/ui/tabs";
import { ProfileGetOne } from "@/modules/profile/types";

interface PersonalInfoTabProps {
  tabContenValue: string;
  profilePayload: ProfileGetOne;
}

export default function PersonalInfoTab({
  tabContenValue,
  profilePayload,
}: PersonalInfoTabProps) {
  return (
    <TabsContent value={tabContenValue}>
      <div className="border-border bg-muted rounded-2xl border p-8 shadow-lg">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
            <User className="h-6 w-6" />
          </div>

          <div className="">
            <h2 className="text-primary- text-2xl font-bold">
              Driver {profilePayload.userName}
            </h2>
            <p className="font-medium">Contact details and team affiliation</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoCard
              icon={Users}
              label="Team"
              value={profilePayload?.team || "N/A"}
              accentColor="bg-purple-600"
            />

            <InfoCard
              icon={MessageCircle}
              label="Discord"
              value={profilePayload?.discord || ""}
              accentColor="bg-indigo-600"
            />
          </div>

          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-gray-50 to-white p-6 shadow-sm">
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-gray-100 opacity-20" />

            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-green-500 to-green-600">
                  <User className="h-4 w-4 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900">Driver Bio</h3>
              </div>

              <div className="prose max-w-none">
                {profilePayload?.bio ? (
                  <div className="rounded-lg border border-gray-100 bg-white p-4">
                    <p className="leading-relaxed text-gray-700">
                      {profilePayload.bio}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-gray-500 italic">
                      No bio provided yet. Share your racing story!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

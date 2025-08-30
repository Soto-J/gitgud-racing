import { User, Users, MessageCircle } from "lucide-react";

import { ChartData, UserGetOne } from "@/modules/iracing/types";
import { seedData } from "@/modules/iracing/constants";

import { DisciplineCard } from "./discipline-card";
import { InfoCard } from "./info-card";

import { ProfileChart } from "./profile-chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
  member: UserGetOne["member"];
  chartData: ChartData;
}

export const ProfileCard = ({ member, chartData }: ProfileCardProps) => {
  const disciplines = member.licenses?.disciplines
    ? member.licenses.disciplines
    : seedData;

  console.log({ chartData });
  return (
    <div className="space-y-12">
      <Tabs defaultValue="Oval" className="mx-auto">
        <TabsList className="flex flex-wrap items-center justify-center">
          {disciplines.map((discipline, idx) => (
            <TabsTrigger value={discipline.category} key={idx} className="">
              <DisciplineCard
                title={discipline.category}
                iRating={discipline.iRating || 0}
                licenseClass={discipline.licenseClass}
                safetyRating={discipline.safetyRating || "0.0"}
              />
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.values(chartData).map(
          ({ discipline, chartData: disciplineChartData }) => (
            <TabsContent value={discipline} key={discipline}>
              {disciplineChartData?.length > 0 ? (
                <ProfileChart data={disciplineChartData} title={discipline} />
              ) : (
                <Card>
                  <CardContent>
                    <div className="py-8 text-center text-gray-500">
                      No chart data available for this category
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ),
        )}
      </Tabs>

      {/* Driver Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Driver Information
            </h2>
            <p className="text-gray-600">
              Contact details and team affiliation
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoCard
              icon={Users}
              label="Team"
              value={member.profile.team || "N/a"}
              accentColor="bg-purple-600"
            />

            <InfoCard
              icon={MessageCircle}
              label="Discord"
              value={member.profile.discord || ""}
              accentColor="bg-indigo-600"
            />
          </div>

          {/* Enhanced Bio Section */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm">
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-gray-100 opacity-20"></div>
            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Driver Bio</h3>
              </div>
              <div className="prose max-w-none">
                {member.profile.bio ? (
                  <div className="rounded-lg border border-gray-100 bg-white p-4">
                    <p className="leading-relaxed text-gray-700">
                      {member.profile.bio}
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
    </div>
  );
};

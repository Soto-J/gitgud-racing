import { User, Users, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { ChartData, UserGetOne } from "@/modules/iracing/types";

import { DisciplineCard } from "./discipline-card";
import { InfoCard } from "./info-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { seedData } from "@/modules/iracing/constants";

interface ProfileCardProps {
  member: UserGetOne["member"];
  chartData: ChartData;
}

export const ProfileCard = ({ member, chartData }: ProfileCardProps) => {
  // Category mapping to handle inconsistencies between discipline and chart data
  const categoryMapping = {
    Oval: "Oval",
    Sports: "Sport",
    Formula: "Formula",
    "Dirt Oval": "Dirt Oval",
    "Dirt Road": "Dirt Road",
  } as const;

  const disciplines = member.licenses?.disciplines
    ? member.licenses.disciplines
    : seedData;

  // Create a map of discipline data with their corresponding chart data
  // const disciplineChartMap = disciplines.reduce(
  //   (acc, discipline) => {
  //     const chartCategory = categoryMapping[discipline.category];
  //     const disciplineChartData =
  //       chartData?.filter((data) => data.category === chartCategory) || [];

  //     acc[discipline.category] = {
  //       discipline,
  //       chartData: disciplineChartData,
  //       tabValue: discipline.category.toLowerCase().replace(/\s+/g, "-"), // consistent tab values
  //     };

  //     return acc;
  //   },
  //   {} as Record<
  //     string,
  //     {
  //       discipline: (typeof disciplines)[0];
  //       chartData: ChartData;
  //       tabValue: string;
  //     }
  //   >,
  // );
  return (
    <div className="space-y-12">
      <Tabs defaultValue="oval" className="mx-auto">
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

        {chartData &&
          Object.entries(chartData).map(
            ([categoryKey, { discipline, chartData, tabValue }]) => (
              <TabsContent value={tabValue} key={categoryKey}>
                <Card>
                  <CardHeader>
                    <CardTitle>{discipline}</CardTitle>
                    <CardDescription>
                      {chartData?.length > 0
                        ? `Chart data showing ${chartData.length} data points for ${discipline}`
                        : `No chart data available for ${discipline}`}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-6">
                    {chartData?.length > 0 ? (
                      <div className="grid gap-3">
                        <div className="text-sm text-gray-600">
                          Latest data:{" "}
                          {chartData[0]?.when
                            ? new Date(chartData[0].when).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Chart Type: {chartData[0]?.chartType || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No chart data available for this category
                      </div>
                    )}
                  </CardContent>
                </Card>
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

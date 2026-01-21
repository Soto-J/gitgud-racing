import type { UserData } from "@/modules/iracing/server/procedures/get-user/types";
import { UserChartData } from "@/modules/iracing/server/procedures/user-chart-data/schema";
import { seedData } from "@/modules/iracing/constants";

import { DisciplineCard } from "@/components/profile/discipline-card";
import { RatingsChart } from "@/components/profile/ratings-chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
  user: UserData;
  // chartData: UserChartData | null;
}

export default function IracingInfo({ user }: ProfileCardProps) {
  const disciplines =
    user.members?.licenses?.disciplines?.length > 0
      ? user.licenses.disciplines
      : seedData;

  return (
    <TabsContent value="iRacing">
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

          {chartData ? (
            Object.values(chartData).map(
              ({ discipline, chartData: disciplineChartData }) => (
                <TabsContent value={discipline} key={discipline}>
                  <RatingsChart data={disciplineChartData} title={discipline} />
                </TabsContent>
              ),
            )
          ) : (
            <Card>
              <CardContent>
                <div className="py-8 text-center text-gray-500">
                  No chart data available for this category
                </div>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </div>
    </TabsContent>
  );
}

import { UserChartData } from "@/modules/iracing/server/procedures/chart-data/types";
import { seedData } from "@/modules/iracing/constants";

import { UserLicenses } from "@/modules/iracing/server/procedures/user-licenses/types";

import DisciplineCard from "@/components/profile/discipline-card";
import { RatingsChart } from "@/components/profile/ratings-chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface IracingInfoProps {
  iracingPayload: UserLicenses;
  // chartData: UserChartData | null;
  chartData: {};
}

export default function IracingInfo({
  iracingPayload,
  chartData,
}: IracingInfoProps) {
  return (
    <TabsContent value="iRacing">
      <div className="space-y-12">
        <Tabs defaultValue="Oval" className="mx-auto">
          <TabsList className="flex flex-wrap items-center justify-center">
            {iracingPayload.licenses.map((discipline, idx) => (
              <TabsTrigger key={idx} value={discipline.categoryName}>
                <DisciplineCard
                  categoryName={discipline.categoryName}
                  iRating={discipline.irating ?? 0}
                  safetyRating={discipline.safetyRating}
                  licenseClass={discipline.licenseClass}
                  licenseColor={discipline.color}
                />
              </TabsTrigger>
            ))}
          </TabsList>

          {/* {chartData ? (
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
          )} */}
        </Tabs>
      </div>
    </TabsContent>
  );
}

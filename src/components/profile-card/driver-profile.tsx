import { IRacingChartData, IRacingUserData } from "@/modules/iracing/types";
import { seedData } from "@/modules/iracing/constants";

import { DisciplineCard } from "./discipline-card";

import { RatingsChart } from "./ratings-chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DriverInfo } from "./driver-info";

interface ProfileCardProps {
  member: IRacingUserData;
  chartData: IRacingChartData | null;
}

export const DriverProfile = ({ member, chartData }: ProfileCardProps) => {
  const disciplines =
    member?.licenses?.disciplines.length > 0
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

      <DriverInfo profile={member?.profile} />
    </div>
  );
};

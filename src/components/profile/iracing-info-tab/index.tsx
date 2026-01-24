import { UserChartData } from "@/modules/iracing/server/procedures/chart-data/types";

import { UserLicenses } from "@/modules/iracing/server/procedures/user-licenses/types";

import DisciplineCard from "./discipline-card";
import RatingsChart from "./ratings-chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IracingInfoProps {
  tabContenValue: string;
  iracingPayload: UserLicenses;
  chartDataPoints: UserChartData;
}

export default function IracingInfoTab({
  tabContenValue,
  iracingPayload,
  chartDataPoints,
}: IracingInfoProps) {
  return (
    <TabsContent value={tabContenValue}>
      <div className="space-y-12">
        <Tabs defaultValue="oval" className="mx-auto space-y-6">
          <TabsList className="bg-transparent flex flex-wrap items-center justify-center gap-4">
            {iracingPayload.licenses.map((discipline, idx) => (
              <TabsTrigger
                key={idx}
                value={discipline.categoryName.toLowerCase()}
              >
                <DisciplineCard
                  categoryImageSrc={discipline.categoryImageSrc}
                  categoryName={discipline.categoryName}
                  iRating={discipline?.irating ?? 0}
                  safetyRating={discipline.safetyRating}
                  licenseClass={discipline.licenseClass}
                  licenseColor={discipline.color}
                />
              </TabsTrigger>
            ))}
          </TabsList>

          {chartDataPoints.map(({ data, categoryName, chartType }) => (
            <TabsContent key={categoryName} value={categoryName}>
              <RatingsChart
                data={data}
                title={categoryName}
                chartType={chartType}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </TabsContent>
  );
}

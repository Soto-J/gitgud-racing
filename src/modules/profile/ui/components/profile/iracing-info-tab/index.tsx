import { UserChartData } from "@/modules/profile/server/procedures/category-chart/types";
import DisciplineCard from "./discipline-card";
import RatingsChart from "./ratings-chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { License } from "@/lib/iracing/member/get/types";
import { ProfileGetOneWithIracing } from "@/modules/profile/server/procedures/get-one-with-iracing/types";

interface IracingInfoProps {
  tabKey: string;
  LicensePayload: ProfileGetOneWithIracing["iracing"]["licenses"];
  chartDataPoints: ProfileGetOneWithIracing["chartData"];
}

export default function IracingInfoTab({
  tabKey,
  LicensePayload,
  chartDataPoints,
}: IracingInfoProps) {
  return (
    <TabsContent value={tabKey}>
      <div className="space-y-12">
        <Tabs defaultValue="oval" className="mx-auto space-y-6">
          <TabsList className="flex flex-wrap items-center justify-center gap-4 bg-transparent">
            {LicensePayload.map((discipline, idx) => (
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

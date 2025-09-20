import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export const GitGudSchedule = () => {
  const mockSchedule = [
    {
      date: "",
      time: "",
      track: "",
      timeLimie: "",
      weather: "",
    },
  ];
  return (
    <TabsContent value="gitGud">
      <Card>
        <CardHeader>
          <CardTitle>GitGud</CardTitle>

          <CardDescription>
            Make changes to your account here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>

        <CardContent></CardContent>
      </Card>
    </TabsContent>
  );
};

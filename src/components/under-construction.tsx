import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnderConstructionProps {
  title?: string;
  message?: string;
  className?: string;
}

export function UnderConstruction({
  title = "Under Construction",
  message = "This page is currently being built. Please check back later!",
  className,
}: UnderConstructionProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className={className}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
import type { ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const WeekDay = ({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <th {...props} className={cn(className, "text-primary py-4 font-semibold")}>
      {children}
    </th>
  );
};

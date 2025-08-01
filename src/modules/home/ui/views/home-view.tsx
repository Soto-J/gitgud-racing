"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { toast } from "sonner";

export const HomeView = () => {
  // const trpc = useTRPC();
  // const { data } = useSuspenseQuery(
  //   trpc.iracing.getDocumentation.queryOptions(),
  // );

  // console.log(data);

  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center">
      Home View
      {/* <div>{JSON.stringify(data, null, 2)}</div> */}
    </div>
  );
};

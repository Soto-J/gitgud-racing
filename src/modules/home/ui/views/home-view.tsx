"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const HomeView = () => {
  // const trpc = useTRPC();

  // const login = useMutation(
  //   trpc.iracing.login.mutationOptions({
  //     onSuccess: () => {
  //       console.log("Loged in");
  //       toast.success("Loged in!");
  //     },
  //     onError: (error) => {
  //       console.error(error.message);
  //       toast.error(error.message);
  //     },
  //   }),
  // );

  // const onClick = () => {
  //   const data = login.mutate({
  //     email: "sotosoloco@gmail.com",
  //     password: "7123Dell!05260112",
  //     userId: "Wrf3AZpPBYmDjALI4qJEmcqxPJGD2M5Y",
  //   });
  //   console.log({ data });
  // };
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center">
      Home View
      {/* <button onClick={onClick}>Click</button> */}
    </div>
  );
};

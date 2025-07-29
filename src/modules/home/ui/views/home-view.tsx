"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { toast } from "sonner";

interface HomeViewProps {
  userId: string;
}

export const HomeView = ({ userId }: HomeViewProps) => {
  const trpc = useTRPC();

  const iracingLogin = useMutation(
    trpc.iracing.login.mutationOptions({
      onSuccess: () => {
        console.log("Loged in");
        toast.success("Loged in!");
      },
      onError: (error) => {
        console.error(error.message);
        toast.error(error.message);
      },
    }),
  );

  const onClick = () => {
    const data = iracingLogin.mutate({
      email: "sotosoloco@gmail.com",
      password: process.env.NEXT_PUBLIC_IRACING_PASSWORD!,
      userId: "Wrf3AZpPBYmDjALI4qJEmcqxPJGD2M5Y",
    });
    console.log({ data });
  };

  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center">
      Home View
      {/* <button onClick={onClick} className="bg-red-500 p-4">
        Click
      </button> */}
    </div>
  );
};

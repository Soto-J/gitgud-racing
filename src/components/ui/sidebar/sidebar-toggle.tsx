"use client";

import { useState } from "react";
import Image from "next/image";

import { authClient } from "@/lib/auth/auth-client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export default function SidebarToggle() {
  const { state } = useSidebar();

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const onIracingSubmit = () => {
    setIsPending(true);
    setError(null);

    authClient.signIn.oauth2(
      {
        providerId: "iracing",
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setIsPending(false);
          setError(null);
        },
        onError: ({ error }) => {
          setIsPending(false);
          setError(error.message);
        },
      },
    );
  };

  return (
    <header className="from-background via-background/95 to-background/90 border-border/50 relative flex items-center gap-x-4 border-b bg-gradient-to-r px-4 py-3 shadow-sm shadow-black/5 backdrop-blur-md dark:shadow-white/5">
      <SidebarTrigger
        variant="outline"
        className="border-sidebar-border/70 hover:border-sidebar-primary/50 hover:bg-sidebar-accent/10 hover:shadow-sidebar-primary/10 focus-visible:border-sidebar-primary focus-visible:ring-sidebar-primary/20 size-9 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
        aria-expanded={state === "expanded"}
        aria-controls="main-sidebar"
        aria-label={`${state === "collapsed" ? "Expand" : "Collapse"} sidebar navigation`}
      />

      <Button
        onClick={() => onIracingSubmit()}
        disabled={isPending}
        variant="outline"
        type="button"
        className="relative"
      >
        <Image
          src="/iRacing-Brandmarks/iRacing-Stacked-Color-Blue.svg"
          alt="iracing"
          width={25}
          height={25}
          className=""
        />
      </Button>
    </header>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

import { ChevronDownIcon, LogOutIcon } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

import GeneratedAvatar from "@/components/generated-avatar";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function SidebarUserButton() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: session, isPending } = authClient.useSession();

  const onSignout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.refresh(),
      },
    });
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className="border-border/10 bg-foreground/5 hover:bg-foreground/10 flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border p-3">
          {session.user.image ? (
            <Avatar>
              <AvatarImage src={session.user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={session.user.name}
              variant="initials"
              className="size-8"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left font-medium">
            <p className="w-full truncate text-sm capitalize">
              {session.user.name}
            </p>
            <p className="w-full truncate text-xs">{session.user.email}</p>
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader className="font-medium">
            <DrawerTitle className="capitalize">
              {session.user.name}
            </DrawerTitle>
            <DrawerDescription>{session.user.email}</DrawerDescription>
          </DrawerHeader>

          <DrawerFooter>
            <Button variant="outline" onClick={onSignout}>
              <LogOutIcon className="text-background size-4" />
              <span>Logout</span>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-border/10 bg-foreground/5 hover:bg-foreground/10 flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border p-3">
        {session.user.image ? (
          <Avatar>
            <AvatarImage src={session.user.image} />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={session.user.name}
            variant="initials"
            className="size-8"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left font-medium">
          <p className="w-full truncate text-sm capitalize">
            {session.user.name}
          </p>
          <p className="w-full truncate text-xs">{session.user.email}</p>
        </div>

        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="right"
        className="border-border bg-muted w-72 rounded"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="truncate font-medium capitalize">
              {session.user.name}
            </span>
            <span className="text-muted-foreground truncate text-sm font-normal">
              {session.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={onSignout}
          className="flex cursor-pointer items-center justify-between"
        >
          <span>Logout</span>
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

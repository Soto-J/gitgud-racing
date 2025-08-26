"use client";

import { useState } from "react";

import { Ellipsis, Edit, Trash2 } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { AdminGetUser } from "@/modules/manage/types";

import { Button } from "@/components/ui/button";
import { ManageEditProfileDialog } from "../form/manage-edit-profile-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionsProps {
  user: AdminGetUser;
  filters: {
    search: string;
    page: number;
    memberId: string;
  };
  confirmDelete: () => Promise<boolean>;
}

export const TableActions = ({
  user,
  filters,
  confirmDelete,
}: ActionsProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const deleteUser = useMutation(
    trpc.manage.deleteUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.manage.getUsers.queryOptions({ ...filters }),
        );
      },
      onError: (error) => console.error(error.message),
    }),
  );

  const onDelete = async () => {
    const Ok = await confirmDelete();

    if (!Ok) {
      return;
    }

    deleteUser.mutate({ userId: user.id });
  };

  return (
    <>
      <ManageEditProfileDialog
        onOpenDialog={openDialog}
        onCloseDialog={() => setOpenDialog(false)}
        initialValues={user}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-zinc-800/50"
          >
            <span className="sr-only">Open menu</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-48 border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setOpenDialog(true)}
              className="group cursor-pointer text-zinc-300 focus:bg-zinc-800"
            >
              <Edit className="mr-2 h-4 w-4 group-focus:text-zinc-300" />
              <span className="group-focus:text-zinc-300">Edit Member</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-zinc-800" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="group cursor-pointer text-red-400 focus:bg-red-500/20 focus:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4 group-focus:text-red-600" />
              <span className="group-focus:text-red-600">Delete Member</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

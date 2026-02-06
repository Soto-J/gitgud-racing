"use client";

import { useState, MouseEvent } from "react";
import { toast } from "sonner";
import { Settings } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import type { Row } from "@tanstack/react-table";
import type { RosterUser } from "@/modules/roster/server/procedures/get-many/types";

import { useConfirm } from "@/hooks/use-confirm";
import { useRosterFilters } from "@/modules/roster/hooks/use-roster-filter";

import EditDialog from "@/modules/roster/ui/components/roster-dialogs/edit-dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import BanDialog from "../roster-dialogs/ban-dialog";

interface ActionsColumnProps {
  row: Row<RosterUser>;
}

export default function ActionsColumn({ row }: ActionsColumnProps) {
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);
  const [banDialogIsOpen, setBanDialogIsOpen] = useState(false);
  const [filter] = useRosterFilters();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteUser = useMutation(
    trpc.roster.deleteUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.roster.getMany.queryOptions({ ...filter }),
        );

        toast.success(`Successfully deleted ${row.original.name}!`);
      },
      onError: (error) => {
        console.error(error);
        toast.error(`Something went wrong deleting ${row.original.name}`);
      },
    }),
  );

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm({
    title: "Delete User",
    description: "Are you sure? This action can't be undone.",
  });

  const onDeleteHandler = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const OK = await confirmDelete();
    if (!OK) return;

    deleteUser.mutate({ userId: row.original.id });
  };

  return (
    <>
      <DeleteConfirmationDialog />
      <EditDialog
        isOpen={editDialogIsOpen}
        onCloseDialog={() => setEditDialogIsOpen(false)}
        initialValues={row.original}
      />
      <BanDialog
        isOpen={banDialogIsOpen}
        onCloseDialog={() => setBanDialogIsOpen(false)}
        initialValues={row.original}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Settings size={22} />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditDialogIsOpen(true);
              }}
              className="cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setBanDialogIsOpen(true);
              }}
              className="border-secondary cursor-pointer border"
            >
              Ban
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDeleteHandler}
              className="border-destructive cursor-pointer border"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { Edit, Ellipsis, Trash2 } from "lucide-react";

import { useTRPC } from "@/trpc/client";

import { MemberGetOne } from "@/modules/members/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<MemberGetOne>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <span
          className={
            true ? "font-medium text-green-600" : "font-medium text-red-600"
          }
        >
          {true ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <div className="cursor-pointer">
          <Link href={`/members/${row.original.id}`} className="capitalize">
            {row.original.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "manage",
    cell: ({ row, filters, confirmDelete }) => {
      const trpc = useTRPC();
      const queryClient = useQueryClient();

      // const updateUser = useMutation(
      //   trpc.profile.adminEdit.mutationOptions({
      //     onSuccess: async () => {
      //       await queryClient.invalidateQueries(
      //         trpc.members.getMany.queryOptions({ ...filters }),
      //       );
      //     },
      //     onError: (error) => console.error(error.message),
      //   }),
      // );

      const deleteUser = useMutation(
        trpc.profile.adminDelete.mutationOptions({
          onSuccess: async () => {
            await queryClient.invalidateQueries(
              trpc.members.getMany.queryOptions({ ...filters }),
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

        deleteUser.mutate({ userId: row.original.id });
      };

      return (
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
              <DropdownMenuItem className="group cursor-pointer text-zinc-300 focus:bg-zinc-800">
                <Edit className="focus:group-text-zinc-300 mr-2 h-4 w-4" />
                <span className="focus:group-text-zinc-300">Edit Member</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-zinc-800" />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="group cursor-pointer text-red-400 focus:bg-red-500/20 focus:text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="focus:group-text-red-600 mr-2 h-4 w-4" />
                <span className="focus:group-text-red-600">Delete Member</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

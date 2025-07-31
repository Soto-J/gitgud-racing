"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { Ellipsis } from "lucide-react";

import { useTRPC } from "@/trpc/client";

import { MemberGetOne } from "@/modules/members/types";

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
    cell: ({ row, table }) => {
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
    cell: ({ row, filters }) => {
      const trpc = useTRPC();
      const queryClient = useQueryClient();

      const updateUser = useMutation(
        trpc.profile.adminEdit.mutationOptions({
          onSuccess: async () => {
            await queryClient.invalidateQueries(
              trpc.members.getMany.queryOptions({ ...filters }),
            );
          },
          onError: (error) => console.error(error.message),
        }),
      );

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

      const onDelete = () => {
        // TODO: Add confirm
        deleteUser.mutate({ userId: row.original.id });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center">
            <Ellipsis className="cursor-pointer" size={20} />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="rounded bg-zinc-500 p-4">
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer bg-blue-500">
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer bg-red-500"
                onClick={onDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

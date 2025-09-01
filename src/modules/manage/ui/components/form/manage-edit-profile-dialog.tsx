"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { AdminGetUser } from "@/modules/manage/types";
import { UpdateUserProfileInputSchema } from "@/modules/manage/schema";

import { useMembersFilters } from "@/modules/manage/hooks/use-members-filter";

import { FormActions } from "@/modules/manage/ui/components/form/form-actions";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ManageEditProfileDialogProps {
  onOpenDialog: boolean;
  onCloseDialog: () => void;
  initialValues: AdminGetUser;
}

export const ManageEditProfileDialog = ({
  onOpenDialog,
  onCloseDialog,
  initialValues,
}: ManageEditProfileDialogProps) => {
  const [filters, _] = useMembersFilters();

  type FormData = z.infer<typeof UpdateUserProfileInputSchema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(UpdateUserProfileInputSchema),
    defaultValues: {
      team: initialValues.team || "",
      isActive: initialValues.isActive,
      role: initialValues.role as "admin" | "staff" | "member",
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editProfile = useMutation(
    trpc.manage.editUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.manage.getUsers.queryOptions({
            ...filters,
          }),
        );

        toast.success("Profile Updated!");
        onCloseDialog();
      },

      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (values: FormData) => {
    editProfile.mutate({
      userId: initialValues.id,
      ...values,
    });
  };

  return (
    <ResponsiveDialog
      title="Edit Member"
      description={`${initialValues.name}'s profile`}
      isOpen={onOpenDialog}
      onOpenChange={onCloseDialog}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[50vh] overflow-hidden"
        >
          <div className="space-y-6 p-6">
            <FormField
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:bg-gray-800/50">
                    <div className="space-y-1">
                      <FormLabel
                        htmlFor="isActive"
                        className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        Member Status
                      </FormLabel>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Toggle member&apos;s active status
                      </p>
                    </div>

                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <span
                          className={cn(
                            `text-sm font-medium transition-colors`,
                            field.value
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-500 dark:text-gray-400",
                          )}
                        >
                          {field.value ? "Active" : "Inactive"}
                        </span>

                        <Switch
                          id="isActive"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Field */}
            <FormField
              name="team"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Team Assignment
                      </FormLabel>

                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Select the team for this member
                      </p>
                    </div>
                    <FormControl>
                      <div className="w-full sm:w-48">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-10 w-full border-gray-300 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600">
                            <SelectValue placeholder="Choose team" />
                          </SelectTrigger>

                          <SelectContent className="z-50">
                            <SelectGroup>
                              <SelectItem
                                value="team1"
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                  Team Alpha
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="team2"
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                  Team Beta
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="team3"
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                  Team Gamma
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Field */}
            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Member Role
                      </FormLabel>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Define access level and permissions
                      </p>
                    </div>

                    <FormControl>
                      <div className="w-full sm:w-48">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-10 w-full border-gray-300 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>

                          <SelectContent className="z-50">
                            <SelectGroup className="">
                              <SelectItem
                                value="admin"
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex w-full items-center justify-between gap-x-2">
                                  <span className="font-medium">Admin</span>
                                  <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                    Full Access
                                  </span>
                                </div>
                              </SelectItem>

                              <SelectItem
                                value="staff"
                                className="cursor-pointer px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center justify-between gap-x-2">
                                  <span className="font-medium">Staff</span>
                                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    Limited Access
                                  </span>
                                </div>
                              </SelectItem>

                              <SelectItem
                                value="member"
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex w-full items-center justify-between gap-x-2">
                                  <span className="font-medium">Member</span>
                                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    Minimum Access
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormActions
            isPending={editProfile.isPending}
            onCloseDialog={onCloseDialog}
          />
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

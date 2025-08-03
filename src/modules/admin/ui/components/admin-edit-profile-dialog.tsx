"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { AdminGetUser } from "@/modules/admin/types";
import { profileInsertSchema } from "@/modules/admin/schema";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AdminEditProfileDialogProps {
  onOpenDialog: boolean;
  onCloseDialog: () => void;
  initialValues: AdminGetUser;
}

export const AdminEditProfileDialog = ({
  onOpenDialog,
  onCloseDialog,
  initialValues,
}: AdminEditProfileDialogProps) => {
  const [firstName, lastName] = initialValues.name.split(" ");

  const form = useForm<z.infer<typeof profileInsertSchema>>({
    resolver: zodResolver(profileInsertSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      team: initialValues.team || "",
      isActive: initialValues.isActive,
      role: initialValues.role,
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editProfile = useMutation(
    trpc.admin.editUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.admin.getUser.queryOptions({
            userId: initialValues.id,
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

  const onSubmit = (values: z.infer<typeof profileInsertSchema>) => {
    editProfile.mutate({
      userId: initialValues.id,
      ...values,
    });
  };

  return (
    <ResponsiveDialog
      title="Edit Member"
      description="Edit member profile"
      isOpen={onOpenDialog}
      onOpenChange={onCloseDialog}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[80vh] overflow-hidden"
        >
          <ScrollArea className="h-[400px]">
            <div className="space-y-6 p-4">
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>

                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>

                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="team"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>

                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active Status</FormLabel>
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                name="role"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="member" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={editProfile.isPending}
              onClick={onCloseDialog}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={editProfile.isPending}>
              Update
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

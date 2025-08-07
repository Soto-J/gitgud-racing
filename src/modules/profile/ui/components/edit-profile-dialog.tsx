"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { profileInsertSchema } from "@/modules/profile/schema";
import { ProfileGetOne } from "@/modules/profile/types";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface EditProfileDialogProps {
  onOpenDialog: boolean;
  onCloseDialog: () => void;
  initialValues: ProfileGetOne;
}

export const EditProfileDialog = ({
  onOpenDialog,
  onCloseDialog,
  initialValues,
}: EditProfileDialogProps) => {
  const [firstName, lastName] = initialValues.memberName.split(" ");

  const form = useForm<z.infer<typeof profileInsertSchema>>({
    resolver: zodResolver(profileInsertSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      iRacingId: initialValues?.iracingId || "0",
      discord: initialValues?.discord ?? "",
      bio: initialValues?.bio ?? "",
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editProfile = useMutation(
    trpc.profile.edit.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.profile.getOne.queryOptions({
            userId: initialValues.userId,
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
      userId: initialValues.userId || "",
      ...values,
    });
  };

  return (
    <ResponsiveDialog
      title="Profile"
      description="Edit your profile"
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
                name="iRacingId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IRacing ID</FormLabel>

                    <FormControl>
                      <Input placeholder="" type="number" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="discord"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord</FormLabel>

                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="bio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>

                    <FormControl>
                      <Textarea {...field} />
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

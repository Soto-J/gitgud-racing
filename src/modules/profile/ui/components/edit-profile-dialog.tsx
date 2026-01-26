"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { ProfileSchema } from "@/modules/profile/server/procedures/edit/types/schema";
import { ProfileGetOne } from "@/modules/profile/types";

import ResponsiveDialog from "@/components/responsive-dialog";
import FieldErrorMessage from "@/components/field-error-message";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

interface EditProfileDialogProps {
  isOpen: boolean;
  onCloseDialog: () => void;
  initialValues: ProfileGetOne;
}

export default function EditProfileDialog({
  isOpen,
  onCloseDialog,
  initialValues,
}: EditProfileDialogProps) {
  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      discord: initialValues.discord ?? "",
      bio: initialValues.bio ?? "",
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editProfile = useMutation(
    trpc.profile.edit.mutationOptions({
      onSuccess: async () => {
        if (initialValues?.userId) {
          await queryClient.invalidateQueries(
            trpc.profile.getOne.queryOptions({
              userId: initialValues?.userId,
            }),
          );
        }

        toast.success("Profile Updated!");
        onCloseDialog();
      },

      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (values: z.infer<typeof ProfileSchema>) => {
    editProfile.mutate({
      userId: initialValues.userId,
      ...values,
    });
  };

  if (!initialValues?.userId) {
    console.warn("EditProfileDialog: Missing user data");
    return null;
  }

  return (
    <ResponsiveDialog
      title="Edit Profile"
      description="Update your racing profile information"
      isOpen={isOpen}
      onOpenChange={onCloseDialog}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-h-[80vh] overflow-hidden"
      >
        <FieldGroup>
          <ScrollArea className="h-[450px]">
            <div className="space-y-6 p-4">
              {/* Contact Information Section */}
              <div className="to-foreground rounded-xl border border-purple-100 bg-linear-to-br from-purple-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
                    <span className="text-foreground text-sm font-bold">
                      💬
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Contact Information
                  </h3>
                </div>

                <Controller
                  name="discord"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Discord Username
                      </FieldLabel>

                      <Input
                        {...field}
                        id={field.name}
                        placeholder="username#1234"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />

                      <FieldErrorMessage error={fieldState.error} />
                    </Field>
                  )}
                />
              </div>

              {/* Bio Section */}
              <div className="to-foreground rounded-xl border border-green-100 bg-linear-to-br from-green-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                    <span className="text-foreground text-sm font-bold" />
                  </div>
                  <h3 className="font-semibold text-gray-900">About You</h3>
                </div>

                <Controller
                  name="bio"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Driver Bio
                      </FieldLabel>

                      <Textarea
                        {...field}
                        id={field.name}
                        placeholder="Tell us about your racing journey, favorite series, achievements..."
                        className="min-h-[100px] resize-none border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />

                      <FieldErrorMessage error={fieldState.error} />
                    </Field>
                  )}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="border-muted-foreground flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={editProfile.isPending}
              onClick={onCloseDialog}
              className="border-muted hover:bg-primary text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={editProfile.isPending}
              className="text-foreground rounded"
            >
              {editProfile.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

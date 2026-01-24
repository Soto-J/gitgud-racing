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
  onOpenDialog: boolean;
  onCloseDialog: () => void;
  initialValues: ProfileGetOne;
}

export default function EditProfileDialog({
  onOpenDialog,
  onCloseDialog,
  initialValues,
}: EditProfileDialogProps) {
  const [firstName, lastName] = initialValues.userName.split(" ");

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
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
    if (!initialValues?.userId) {
      console.warn("EditProfileDialog: Cannot submit without user ID");
      return;
    }

    editProfile.mutate({
      userId: initialValues?.userId,
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
      isOpen={onOpenDialog}
      onOpenChange={onCloseDialog}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-h-[80vh] overflow-hidden"
      >
        <FieldGroup>
          <ScrollArea className="h-[450px]">
            <div className="space-y-6 p-4">
              {/* Personal Information Section */}
              <div className="rounded-xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                    <span className="text-sm font-bold text-white">👤</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-700"
                        >
                          First Name
                        </FieldLabel>

                        <Input
                          {...field}
                          id={field.name}
                          placeholder="John"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />

                        <FieldErrorMessage error={fieldState.error} />
                      </Field>
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-700"
                        >
                          Last Name
                        </FieldLabel>

                        <Input
                          {...field}
                          id={field.name}
                          placeholder="Smith"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />

                        <FieldErrorMessage error={fieldState.error} />
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Racing Information Section */}
              <div className="rounded-xl border border-red-100 bg-linear-to-br from-red-50 to-white p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
                    <span className="text-sm font-bold text-white">🏁</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Racing Information
                  </h3>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="rounded-xl border border-purple-100 bg-linear-to-br from-purple-50 to-white p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
                    <span className="text-sm font-bold text-white">💬</span>
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
              <div className="rounded-xl border border-green-100 bg-linear-to-br from-green-50 to-white p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                    <span className="text-sm font-bold text-white" />
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

          <div className="flex items-center justify-between border-t border-gray-200 bg-white pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={editProfile.isPending}
              onClick={onCloseDialog}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={editProfile.isPending}
              className="bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800"
            >
              {editProfile.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

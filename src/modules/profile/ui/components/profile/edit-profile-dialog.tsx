"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { ProfileSchema } from "@/modules/profile/server/procedures/edit/types/schema";
import type { ProfileGetOne } from "@/modules/profile/types";

import { MessageCircle, FileText, Mail } from "lucide-react";

import ResponsiveDialog from "@/components/responsive-dialog";
import FieldErrorMessage from "@/components/field-error-message";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field";
import { FaDiscord } from "react-icons/fa";

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
      email: initialValues.email ?? "",
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
    editProfile.mutate({ ...values });
  };

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
              <div className="border-border bg-card/30 rounded-xl border p-4 shadow-xs">
                <FieldLegend className="mb-4 flex items-center gap-2">
                  <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                    <MessageCircle className="text-primary h-4 w-4" />
                  </div>
                  <h3 className="text-card-foreground font-medium">
                    Contact Information
                  </h3>
                </FieldLegend>

                <div className="space-y-4">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-muted-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="text-primary h-4 w-4" />
                            Email Address
                          </div>
                        </FieldLabel>

                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          placeholder="your@email.com"
                          className="border-input focus:border-primary focus:ring-primary"
                        />

                        <FieldErrorMessage error={fieldState.error} />
                      </Field>
                    )}
                  />

                  <Controller
                    name="discord"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-[#5865F2]"
                        >
                          <FaDiscord className="h-4 w-4 text-[#5865F2]" />
                          Discord Username
                        </FieldLabel>

                        <Input
                          {...field}
                          id={field.name}
                          placeholder="username#1234"
                          className="border-input focus:border-primary focus:ring-primary"
                        />

                        <FieldErrorMessage error={fieldState.error} />
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div className="border-border bg-card/30 rounded-xl border p-4 shadow-xs">
                <FieldLegend className="mb-4 flex items-center gap-2">
                  <div className="bg-secondary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FileText className="text-secondary h-4 w-4" />
                  </div>
                  <h3 className="text-card-foreground font-medium">
                    About You
                  </h3>
                </FieldLegend>

                <Controller
                  name="bio"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-muted-foreground text-sm font-medium"
                      >
                        Driver Bio
                      </FieldLabel>

                      <Textarea
                        {...field}
                        id={field.name}
                        placeholder="Tell us about your racing journey, favorite series, achievements..."
                        className="border-input focus:border-secondary focus:ring-secondary min-h-[100px] resize-none"
                      />

                      <FieldErrorMessage error={fieldState.error} />
                    </Field>
                  )}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="border-border flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={editProfile.isPending}
              onClick={onCloseDialog}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={editProfile.isPending}>
              {editProfile.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

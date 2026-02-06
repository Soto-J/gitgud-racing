"use client";

import { Activity } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useRosterFilters } from "@/modules/roster/hooks/use-roster-filter";

import type { RosterUser } from "@/modules/roster/server/procedures/get-many/types";
import { BanUserFieldsSchema } from "@/modules/roster/server/procedures/ban-user/types/schema";

import ResponsiveDialog from "@/components/responsive-dialog";
import FieldErrorMessage from "@/components/field-error-message";
import FormActions from "./form-actions";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

interface BanDialogProps {
  isOpen: boolean;
  onCloseDialog: () => void;
  initialValues: RosterUser;
}

export default function BanDialog({
  isOpen,
  onCloseDialog,
  initialValues,
}: BanDialogProps) {
  const [filters] = useRosterFilters();

  type FormData = z.infer<typeof BanUserFieldsSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(BanUserFieldsSchema),
    defaultValues: {
      banReason: initialValues.banReason ?? "",
      banned: initialValues.banned ?? false,
    },
  });

  const isBanned = form.watch("banned");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const banUser = useMutation(
    trpc.roster.banUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.roster.getMany.queryOptions({
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
    banUser.mutate({
      ...values,
      userId: initialValues.id,
    });
  };

  return (
    <ResponsiveDialog
      title="Ban Member"
      description={`${initialValues.name}'s profile`}
      isOpen={isOpen}
      onOpenChange={onCloseDialog}
      preventOutsideClose
    >
      <form
        onSubmit={form.handleSubmit(onSubmit, (error) => {
          console.log(error);
        })}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[50vh] overflow-hidden"
      >
        <div className="space-y-6 p-6">
          <Controller
            name="banned"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  field.value
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-muted/50",
                )}
              >
                <FieldContent>
                  <FieldTitle>Ban Status</FieldTitle>
                  <FieldDescription>
                    {field.value
                      ? "This member is currently banned"
                      : "Toggle to ban this member"}
                  </FieldDescription>
                </FieldContent>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      field.value
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {field.value ? "Banned" : "Active"}
                  </span>

                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-destructive"
                  />
                </div>

                <FieldErrorMessage error={fieldState.error} />
              </Field>
            )}
          />

          <Activity mode={isBanned ? "visible" : "hidden"}>
            <Controller
              name="banReason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Ban Reason</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Reason for banning this member..."
                  />

                  <FieldErrorMessage error={fieldState.error} />
                </Field>
              )}
            />
          </Activity>
        </div>

        <FormActions
          isPending={banUser.isPending}
          onCloseDialog={onCloseDialog}
          submitLabel="Confirm Ban"
          pendingLabel="Banning..."
        />
      </form>
    </ResponsiveDialog>
  );
}

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useRosterFilters } from "@/modules/roster/hooks/use-roster-filter";
import type { RosterUser } from "@/modules/roster/server/procedures/get-many/types";
import { EditUserFieldsSchema } from "@/modules/roster/server/procedures/edit-user/types/schema";

import ResponsiveDialog from "@/components/responsive-dialog";
import FieldErrorMessage from "@/components/field-error-message";
import FormActions from "@/components/form-actions";

import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditDialogProps {
  isOpen: boolean;
  onCloseDialog: () => void;
  initialValues: RosterUser;
}

export default function EditDialog({
  isOpen,
  onCloseDialog,
  initialValues,
}: EditDialogProps) {
  const [filters] = useRosterFilters();

  type FormData = z.infer<typeof EditUserFieldsSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(EditUserFieldsSchema),
    defaultValues: {
      team: initialValues.team || "",
      isActive: initialValues.isActive,
      role: initialValues.role,
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editProfile = useMutation(
    trpc.roster.editUser.mutationOptions({
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
    editProfile.mutate({
      ...values,
      userId: initialValues.id,
    });
  };

  return (
    <ResponsiveDialog
      title="Edit Member"
      description={`${initialValues.name}'s profile`}
      isOpen={isOpen}
      onOpenChange={onCloseDialog}
      preventOutsideClose
    >
      <form
        onSubmit={form.handleSubmit(onSubmit, (error) => {
          console.log(error);
        })}
        className="max-h-[50vh] overflow-hidden"
      >
        <div className="space-y-6 p-6">
          <Controller
            name="isActive"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  field.value
                    ? "border-secondary/30 bg-secondary/5"
                    : "border-border bg-muted/50",
                )}
              >
                <FieldContent>
                  <FieldTitle>Member Status</FieldTitle>
                  <FieldDescription>
                    {field.value
                      ? "This member is currently active"
                      : "Toggle to activate this member"}
                  </FieldDescription>
                </FieldContent>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      field.value ? "text-secondary" : "text-muted-foreground",
                    )}
                  >
                    {field.value ? "Active" : "Inactive"}
                  </span>

                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>

                <FieldErrorMessage error={fieldState.error} />
              </Field>
            )}
          />

          <Controller
            name="team"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Team Assignment</FieldTitle>
                  <FieldDescription>
                    Select the team for this member
                  </FieldDescription>
                </FieldContent>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className="w-full sm:w-48">
                    <SelectValue placeholder="Choose team" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="team1">Team Alpha</SelectItem>
                      <SelectItem value="team2">Team Beta</SelectItem>
                      <SelectItem value="team3">Team Gamma</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldErrorMessage error={fieldState.error} />
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Member Role</FieldTitle>
                  <FieldDescription>
                    Define access level and permissions
                  </FieldDescription>
                </FieldContent>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <span>Admin</span>
                          <span className="bg-secondary/10 text-secondary rounded px-1.5 py-0.5 text-xs">
                            Full
                          </span>
                        </div>
                      </SelectItem>

                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <span>Staff</span>
                          <span className="bg-accent/10 text-accent-foreground rounded px-1.5 py-0.5 text-xs">
                            Limited
                          </span>
                        </div>
                      </SelectItem>

                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <span>User</span>
                          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                            Standard
                          </span>
                        </div>
                      </SelectItem>

                      <SelectItem value="guest">
                        <div className="flex items-center gap-2">
                          <span>Guest</span>
                          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                            Minimum
                          </span>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldErrorMessage error={fieldState.error} />
              </Field>
            )}
          />
        </div>
        <FormActions
          isPending={editProfile.isPending}
          onCloseDialog={onCloseDialog}
        />
      </form>
    </ResponsiveDialog>
  );
}

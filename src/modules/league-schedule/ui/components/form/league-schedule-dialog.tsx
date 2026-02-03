"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { LeagueScheduleSchema } from "@/modules/league-schedule/server/procedures/edit/types/schema";
import type { LeagueSchedule } from "@/modules/league-schedule/server/procedures/get-one/types";

import { FormActions } from "@/modules/league-schedule/ui/components/form/form-actions";
import ResponsiveDialog from "@/components/responsive-dialog";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel } from "@/components/ui/field";
import FieldErrorMessage from "@/components/field-error-message";

interface EditLeagueScheduleDialogProps {
  onOpenDialog: boolean;
  onCloseDialog: () => void;
  initialValues: LeagueSchedule | null;
  mode: "Create" | "Edit";
}

export const LeagueScheduleDialog = ({
  onOpenDialog,
  onCloseDialog,
  initialValues,
  mode,
}: EditLeagueScheduleDialogProps) => {
  const form = useForm<z.infer<typeof LeagueScheduleSchema>>({
    resolver: zodResolver(LeagueScheduleSchema),
    values: {
      seasonNumber: initialValues?.seasonNumber || 1,
      trackName: initialValues?.trackName || "",
      temp: initialValues?.temp ?? 70,
      raceLength: initialValues?.raceLength ?? 30,
      date: initialValues?.date
        ? new Date(initialValues.date).toISOString().split("T")[0]
        : "",
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createSchedule = useMutation(
    trpc.leagueSchedule.createLeagueSchedule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.leagueSchedule.getLeagueSchedules.queryOptions(),
        );

        toast.success("Schedule created successfully!");
        onCloseDialog();
      },
      onError: () => {
        toast.error("Something went wrong creating schedule.");
      },
    }),
  );

  const editSchedule = useMutation(
    trpc.leagueSchedule.editLeagueSchedule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.leagueSchedule.getLeagueSchedules.queryOptions(),
        );

        toast.success("Schedule updated successfully!");
        onCloseDialog();
      },

      onError: (error) => {
        console.error(error);
        toast.error("Failed to update schedule");
      },
    }),
  );

  const onSubmit = (values: z.infer<typeof LeagueScheduleSchema>) => {
    if (mode === "Create") {
      createSchedule.mutate(values);
    } else {
      if (!initialValues?.id) {
        return;
      }

      editSchedule.mutate({
        ...values,
        scheduleId: initialValues.id,
      });
    }
  };

  return (
    <ResponsiveDialog
      title={`${mode === "Create" ? "Create" : "Edit"} Schedule`}
      description={
        mode === "Create"
          ? "Create a new race schedule"
          : "Update race schedule details"
      }
      isOpen={onOpenDialog}
      onOpenChange={onCloseDialog}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-h-[50vh] overflow-hidden"
      >
        <ScrollArea className="h-[450px]">
          <div className="space-y-6 p-6">
            <Controller
              name="trackName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Track</FieldLabel>

                  <Input placeholder="Enter track name" {...field} />

                  <FieldErrorMessage error={fieldState.error} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 items-center justify-center gap-8">
              <Controller
                name="seasonNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Season Number</FieldLabel>

                    <Input
                      placeholder="Enter season number"
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />

                    <FieldErrorMessage error={fieldState.error} />
                  </Field>
                )}
              />

              <Controller
                name="temp"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Temperature (°F)</FieldLabel>

                    <Input
                      type="number"
                      placeholder="Enter temperature"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />

                    <FieldErrorMessage error={fieldState.error} />
                  </Field>
                )}
              />

              <Controller
                name="raceLength"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Race Length (Minutes)</FieldLabel>

                    <Input
                      type="number"
                      placeholder="Enter race length"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />

                    <FieldErrorMessage error={fieldState.error} />
                  </Field>
                )}
              />

              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Race Date</FieldLabel>

                    <Input type="date" {...field} />

                    <FieldErrorMessage error={fieldState.error} />
                  </Field>
                )}
              />
            </div>
          </div>

          <FormActions
            isPending={
              mode === "Create"
                ? createSchedule.isPending
                : editSchedule.isPending
            }
            onCloseDialog={onCloseDialog}
            mode={mode}
          />
        </ScrollArea>
      </form>
    </ResponsiveDialog>
  );
};

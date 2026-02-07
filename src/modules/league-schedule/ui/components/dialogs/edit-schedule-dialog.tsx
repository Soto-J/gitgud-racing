"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import type { LeagueScheduleGetOne } from "@/modules/league-schedule/server/procedures/get-one/types";
import { LeagueScheduleSchema } from "@/modules/league-schedule/server/procedures/edit/types/schema";

import FormActions from "@/components/form-actions";
import ResponsiveDialog from "@/components/responsive-dialog";
import FieldErrorMessage from "@/components/field-error-message";

import { SETUP_TYPE, START_TYPE } from "@/db/schemas";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditScheduleDialogProps {
  isOpen: boolean;
  onCloseDialog: () => void;
  initialValues: LeagueScheduleGetOne | null;
  mode: "Create" | "Edit";
}

export const EditScheduleDialog = ({
  isOpen,
  onCloseDialog,
  initialValues,
  mode,
}: EditScheduleDialogProps) => {
  const form = useForm<z.infer<typeof LeagueScheduleSchema>>({
    resolver: zodResolver(LeagueScheduleSchema),
    values: {
      seasonNumber: initialValues?.seasonNumber || 1,
      date: initialValues?.date
        ? new Date(initialValues.date).toISOString().split("T")[0]
        : "",
      car: initialValues?.car || "",
      trackName: initialValues?.trackName || "",
      setupType: initialValues?.setupType ?? "Open",
      startType: initialValues?.startType ?? "Standing",
      raceLength: initialValues?.raceLength ?? 1,
      temp: initialValues?.temp ?? 70,
      disqualification: initialValues?.disqualification ?? 0,
      carDamage: initialValues?.carDamage ?? true,
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createSchedule = useMutation(
    trpc.leagueSchedule.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.leagueSchedule.getMany.queryOptions(),
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
    trpc.leagueSchedule.edit.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.leagueSchedule.getMany.queryOptions(),
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
      isOpen={isOpen}
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

            <Controller
              name="car"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Car</FieldLabel>

                  <Input placeholder="Enter car name" {...field} />

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

              <Controller
                name="setupType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Setup Type</FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select setup type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SETUP_TYPE.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldErrorMessage error={fieldState.error} />
                  </Field>
                )}
              />

              <Controller
                name="startType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Start Type</FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start type" />
                      </SelectTrigger>
                      <SelectContent>
                        {START_TYPE.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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
                name="disqualification"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Disqualification (x)</FieldLabel>

                    <Input
                      type="number"
                      placeholder="Enter multiplier"
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
                name="carDamage"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel>Car Damage</FieldLabel>

                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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
            submitLabel={mode === "Create" ? "Create" : "Update"}
            pendingLabel={mode === "Create" ? "Creating..." : "Updating..."}
          />
        </ScrollArea>
      </form>
    </ResponsiveDialog>
  );
};

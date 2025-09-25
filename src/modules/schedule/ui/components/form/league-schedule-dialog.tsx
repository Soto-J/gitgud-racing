"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { LeagueScheduleSchema } from "@/modules/schedule/server/procedures/league-schedule/edit/schema";
import type { LeagueSchedule } from "@/modules/schedule/server/procedures/league-schedule/get-one/types";

import { FormActions } from "@/modules/schedule/ui/components/form/form-actions";
import { ResponsiveDialog } from "@/components/responsive-dialog";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
    trpc.schedule.createLeagueSchedule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.schedule.getLeagueSchedules.queryOptions(),
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
    trpc.schedule.editLeagueSchedule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.schedule.getLeagueSchedules.queryOptions(),
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[50vh] overflow-hidden"
        >
          <ScrollArea className="h-[450px]">
            <div className="space-y-6 p-6">
              <FormField
                name="trackName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Track</FormLabel>

                    <FormControl>
                      <Input placeholder="Enter track name" {...field} />
                    </FormControl>

                    <FormMessage className="h-4 text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 items-center justify-center gap-8">
                <FormField
                  name="seasonNumber"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season Number</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Enter season number"
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage className="h-4 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="temp"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°F)</FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter temperature"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage className="h-4 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="raceLength"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Race Length (Minutes)</FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter race length"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage className="h-4 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Race Date</FormLabel>

                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>

                      <FormMessage className="h-4 text-xs" />
                    </FormItem>
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
      </Form>
    </ResponsiveDialog>
  );
};

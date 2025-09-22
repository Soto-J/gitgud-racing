"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { LeagueScheduleSchema } from "@/modules/schedule/server/procedures/league-schedule/edit/schema";
import { LeagueSchedule } from "@/modules/schedule/server/procedures/league-schedule/get-one/types";

import { FormActions } from "@/modules/manage/ui/components/form/form-actions";
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
}

export const EditLeagueScheduleDialog = ({
  onOpenDialog,
  onCloseDialog,
  initialValues,
}: EditLeagueScheduleDialogProps) => {
  const form = useForm<z.infer<typeof LeagueScheduleSchema>>({
    resolver: zodResolver(LeagueScheduleSchema),
    values: {
      seasonNumber: initialValues?.seasonNumber ?? 0,
      trackName: initialValues?.trackName || "",
      temp: initialValues?.temp ?? 0,
      raceLength: initialValues?.raceLength ?? 0,
      date: initialValues?.date
        ? new Date(initialValues.date).toISOString().split("T")[0]
        : "",
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const editSchedule = useMutation(
    trpc.schedule.editLeagueSchedule.mutationOptions({
      onSuccess: async (_, data) => {
        await queryClient.invalidateQueries(
          trpc.schedule.getLeagueSchedule.queryOptions({
            scheduleId: data.scheduleId,
          }),
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
    if (!initialValues?.id) {
      return;
    }

    editSchedule.mutate({
      ...values,
      scheduleId: initialValues.id,
    });
  };

  return (
    <ResponsiveDialog
      title="Edit Schedule"
      description="Update race schedule details"
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

                    <FormMessage />
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
                            field.onChange(Number(e.target.value))
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
                            field.onChange(Number(e.target.value))
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
              isPending={editSchedule.isPending}
              onCloseDialog={onCloseDialog}
            />
          </ScrollArea>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

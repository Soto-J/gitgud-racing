"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { profileInsertSchema } from "@/modules/profile/schema";
import { ProfileGetOne } from "@/modules/profile/types";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      iRating: initialValues.iRating.toString() || "0",
      safetyClass: initialValues.safetyClass || "R",
      safetyRating: initialValues.safetyRating?.toString() || "0.0",
      team: initialValues.team || "",
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
          trpc.profile.getOne.queryOptions({ userId: initialValues.userId }),
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
      profileId: initialValues.id,
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
          className="overflow-hidden"
        >
          <ScrollArea className="h-[500px]">
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
                name="iRating"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IRating</FormLabel>

                    <FormControl>
                      <Input type="number" placeholder="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 items-center sm:grid-cols-2">
                <FormField
                  name="safetyClass"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-fit">
                      <FormLabel className="text-sm font-medium">
                        Safety Class
                      </FormLabel>

                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="min-w-[80px] px-2">
                            <SelectValue placeholder="select" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup className="[&>*]:cursor-pointer">
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="R">R</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="safetyRating"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="w-fit text-sm font-medium">
                        Safety Rating
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="4"
                          step="0.01"
                          placeholder="e.g. 3.45"
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e")
                              e.preventDefault();
                          }}
                          className="w-24 px-2"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="team"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>

                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
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

          <div className="flex items-center justify-between  pt-2">
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

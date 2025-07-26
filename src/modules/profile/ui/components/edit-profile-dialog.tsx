"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { profileInsertSchema } from "@/modules/profile/schema";
import { ProfileGetOne } from "@/modules/profile/types";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
      firstName: firstName || "",
      lastName: lastName || "",
      iRacingId: initialValues?.iracingId ?? "",
      iRating: initialValues.iRating?.toString() || "",
      safetyClass: initialValues.safetyClass || "R",
      safetyRating: initialValues.safteyRating?.toString() || "",
      discord: initialValues?.discord ?? "",
      bio: initialValues?.bio ?? "",
    },
  });

  const onSubmit = () => {};

  return (
    <ResponsiveDialog
      title="Profile"
      description="Edit your profile"
      isOpen={onOpenDialog}
      onOpenChange={onCloseDialog}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
          <FormField
            name="firstName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>

                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
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
                  <Input placeholder="" {...field} />
                </FormControl>
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
                    <Select {...field}>
                      <SelectTrigger className="min-w-[80px] px-2">
                        <SelectValue />
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
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      className="w-24 px-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

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
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

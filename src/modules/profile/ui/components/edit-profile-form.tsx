"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { profileInsertSchema } from "@/modules/profile/schema";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface EditProfileFormProps {}

export const EditProfileForm = ({}: EditProfileFormProps) => {
  const form = useForm<z.infer<typeof profileInsertSchema>>({
    resolver: zodResolver(profileInsertSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      iRacingId: "",
      iRating: "",
      sRating: "",
      discord: "",
      bio: "",
    },
  });

  const onSubmit = () => {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Input placeholder="" {...field} />
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

        <FormField
          name="sRating"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SRating</FormLabel>

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
                <Input placeholder="" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

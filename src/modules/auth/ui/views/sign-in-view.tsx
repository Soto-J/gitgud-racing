"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { OctagonAlertIcon } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

import { authClient } from "@/lib/auth-client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export const SignInView = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onGoogleSubmit = () => {
    setIsPending(true);
    setError(null);
    authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setIsPending(false);
          setError(null);
        },

        onError: ({ error }) => {
          setIsPending(false);
          setError(error.message);
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    setError(null);

    authClient.signIn.email(
      { ...values, callbackURL: "/" },
      {
        onSuccess: () => {
          setIsPending(false);
          setError(null);
        },

        onError: ({ error }) => {
          setError(error.message);
          setIsPending(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-bold text-2xl">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>

                      <FormControl>
                        <Input
                          type="email"
                          placeholder="johnsmith@example.com"
                          data-lpignore="true"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Password</FormLabel>

                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="!text-destructive h-4 w-4" />
                    <AlertTitle className="text-red-600">
                      Error: {error}
                    </AlertTitle>
                  </Alert>
                )}

                <Button type="submit" className="bg-primary w-full">
                  Sign in
                </Button>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>

                <Button
                  onClick={() => onGoogleSubmit()}
                  disabled={isPending}
                  variant="outline"
                  type="button"
                  className="w-full"
                >
                  <FaGoogle />
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="underline underline-offset-4 hover:text-[#16A34A]"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="bg-gradient-to-br from-[#000000] via-[#ED1C24] via-60% to-[#FFF200] hidden relative md:block">
            <Image
              src="/gitgud-logo.png"
              alt="Image"
              fill
              priority
              className="object-contain backdrop-blur-5xl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue you agree to our <a href="">Terms and Service</a>{" "}
        and <a href="">Privacy Policy</a>
      </div>
    </div>
  );
};

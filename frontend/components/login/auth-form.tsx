"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { notifySuccess, notifyError, saveAccessToken } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Spinner } from "../ui/spinner";
import { login } from "@/lib/api";
import useApi from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

const authSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const AuthForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { handleRequest: callLoginApi } = useApi(login);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      console.log("Form data:", data);
      const response = await callLoginApi(data);

      if(response.status !== 200){
        throw new Error(response.data.error);
      }
      const access_token = response.data.data.token
      saveAccessToken(access_token);
      router.push("/dashboard");
    } catch (error: any) {
      notifyError(error, "Login failed");
    }
  };

  return (
    <Card className="w-full max-w-md bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Please sign in to your account to proceed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError
                errors={[errors.email]}
                className="text-left text-xs"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaRegEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaRegEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FieldError
                errors={[errors.password]}
                className="text-left text-xs"
              />
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Signing in
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;

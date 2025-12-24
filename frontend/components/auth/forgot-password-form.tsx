"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form-hook"
import { useAuth } from "@/contexts/auth.context"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [submitError, setSubmitError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useAuth()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitError("")
    setSuccess(false)

    try {
      await forgotPassword(data)
      setSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Request failed")
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ziauddin Hospital</CardTitle>
          <CardDescription className="text-gray-600">Pharma Sales & Inventory System</CardDescription>
        </CardHeader>
        <CardContent>
          <CardHeader className="text-center px-0 pt-0">
            <CardTitle className="text-xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-gray-600">We've sent a password reset link to your email address</CardDescription>
          </CardHeader>
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              If an account with that email exists, you'll receive a password reset link shortly.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Ziauddin Hospital</CardTitle>
        <CardDescription className="text-gray-600">Pharma Sales & Inventory System</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

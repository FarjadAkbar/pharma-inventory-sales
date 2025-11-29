"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth.context"
import { validateEmail, getValidationError } from "@/lib/validations"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useAuth()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = getValidationError("email", "required")
    } else if (!validateEmail(email)) {
      newErrors.email = getValidationError("email", "invalid")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSuccess(false)

    try {
      await forgotPassword({ email })
      setSuccess(true)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Request failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto border-orange-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-600">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">We've sent a password reset link to your email address</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              If an account with that email exists, you'll receive a password reset link shortly.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm text-orange-600 hover:text-orange-700">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-orange-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-orange-600">Forgot Password</CardTitle>
        <CardDescription className="text-gray-600">Enter your email address to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? "border-red-500" : "border-gray-300 focus:border-orange-500"}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-orange-600 hover:text-orange-700">
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

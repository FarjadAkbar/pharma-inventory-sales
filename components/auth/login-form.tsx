"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth.context"
import { getValidationError } from "@/lib/validations"
import { OrganizationSelector } from "@/components/auth/organization-selector"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOrgSelector, setShowOrgSelector] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<any>(null)
  const [selectedSite, setSelectedSite] = useState<any>(null)
  const { login } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!selectedOrg) {
      newErrors.organization = "Please select an organization"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await login({ 
        email, 
        password, 
        rememberMe, 
        organization: selectedOrg?.id,
        site: selectedSite?.id 
      })
      router.push("/dashboard")
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Login failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOrgSelect = (org: any, site?: any) => {
    setSelectedOrg(org)
    setSelectedSite(site)
    setShowOrgSelector(false)
  }

  if (showOrgSelector) {
    return (
      <OrganizationSelector
        onSelect={handleOrgSelect}
        onBack={() => setShowOrgSelector(false)}
        className="w-full max-w-4xl mx-auto"
      />
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-orange-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-orange-600">Ziauddin Hospital</CardTitle>
        <CardDescription className="text-gray-600">Pharma Sales & Inventory System</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? "border-red-500 pr-10" : "border-gray-300 focus:border-orange-500 pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Organization & Site</Label>
            <div 
              className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowOrgSelector(true)}
            >
              {selectedOrg ? (
                <div>
                  <div className="font-medium text-sm">{selectedOrg.name}</div>
                  {selectedSite && (
                    <div className="text-xs text-muted-foreground">{selectedSite.name}</div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Select organization and site</div>
              )}
            </div>
            {errors.organization && <p className="text-sm text-red-500">{errors.organization}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-600">
              Remember me
            </Label>
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
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
              Forgot your password?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

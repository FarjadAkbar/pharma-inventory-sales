import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AccessDeniedProps {
  title?: string
  description?: string
  showBackButton?: boolean
}

export function AccessDenied({
  title = "Access Denied",
  description = "You don't have permission to access this resource.",
  showBackButton = true,
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {showBackButton && (
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AccountForm } from "@/components/sales/account-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewAccountPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Account</h1>
          <p className="text-muted-foreground">Add a new customer account to the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Enter the account details below</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

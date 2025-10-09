"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/suppliers")
  }

  const handleCancel = () => {
    router.push("/dashboard/suppliers")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Supplier</h1>
          <p className="text-muted-foreground">Create a new supplier for your organization</p>
        </div>
        
        <SupplierForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}

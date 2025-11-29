"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SupplierForm } from "@/components/suppliers/supplier-form"

interface EditSupplierPageProps {
  params: {
    id: string
  }
}

export default function EditSupplierPage({ params }: EditSupplierPageProps) {
  const router = useRouter()
  const supplierId = parseInt(params.id)

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
          <p className="text-muted-foreground">Update supplier information</p>
        </div>
        
        <SupplierForm supplierId={supplierId} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}

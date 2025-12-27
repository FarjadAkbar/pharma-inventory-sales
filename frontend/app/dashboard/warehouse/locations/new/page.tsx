"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StorageLocationForm } from "@/components/warehouse/storage-location-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"

export default function NewStorageLocationPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.createStorageLocation(data)
      toast.success("Storage location created successfully")
      router.push("/dashboard/warehouse/locations")
    } catch (error: any) {
      toast.error(error.message || "Failed to create storage location")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/locations")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Storage Location</h1>
          <p className="text-muted-foreground">Create a new storage location</p>
        </div>

        <StorageLocationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Location"
        />
      </div>
    </DashboardLayout>
  )
}


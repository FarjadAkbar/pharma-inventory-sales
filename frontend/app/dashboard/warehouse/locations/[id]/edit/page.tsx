"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StorageLocationForm } from "@/components/warehouse/storage-location-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"
import type { StorageLocation } from "@/types/warehouse"

export default function EditStorageLocationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [location, setLocation] = useState<StorageLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocation()
  }, [id])

  const fetchLocation = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getStorageLocation(id)
      setLocation(response)
    } catch (error: any) {
      toast.error(error.message || "Failed to load storage location")
      router.push("/dashboard/warehouse/locations")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.updateStorageLocation(id, data)
      toast.success("Storage location updated successfully")
      router.push("/dashboard/warehouse/locations")
    } catch (error: any) {
      toast.error(error.message || "Failed to update storage location")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/locations")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading storage location...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!location) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Storage Location</h1>
          <p className="text-muted-foreground">Update storage location information</p>
        </div>

        <StorageLocationForm
          initialData={location}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Location"
        />
      </div>
    </DashboardLayout>
  )
}


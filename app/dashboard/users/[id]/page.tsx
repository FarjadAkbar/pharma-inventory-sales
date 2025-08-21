"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserForm } from "@/components/users/user-form"
import { useParams, useRouter } from "next/navigation"
import { apiService } from "@/services/api.service"
import { PermissionGuard } from "@/components/auth/permission-guard"

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/users/${params?.id}`)
      const json = await res.json()
      if (json.success) setUser(json.data)
      setLoading(false)
    }
    load()
  }, [params?.id])

  return (
    <DashboardLayout>
      <PermissionGuard permissions={["edit_users"]} fallback={<div className="p-4">Access denied</div>}>
        <div className="max-w-3xl mx-auto p-4">
          {!loading && user && (
            <UserForm
              initialData={user}
              submitLabel="Save Changes"
              onSubmit={async (data) => {
                await apiService.updateUser({ id: params?.id, ...data })
                router.push("/dashboard/users")
              }}
            />
          )}
        </div>
      </PermissionGuard>
    </DashboardLayout>
  )
}



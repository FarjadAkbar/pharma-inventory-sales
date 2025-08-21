"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserForm } from "@/components/users/user-form"
import { useRouter } from "next/navigation"
import { apiService } from "@/services/api.service"
import { PermissionGuard } from "@/components/auth/permission-guard"

export default function NewUserPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <PermissionGuard permission="create_users" fallback={<div className="p-4">Access denied</div>}>
        <div className="max-w-3xl mx-auto p-4">
          <UserForm
            submitLabel="Create User"
            onSubmit={async (data) => {
              await apiService.createUser(data)
              router.push("/dashboard/users")
            }}
          />
        </div>
      </PermissionGuard>
    </DashboardLayout>
  )
}



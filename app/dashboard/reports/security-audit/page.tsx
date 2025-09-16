"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SecurityAudit } from "@/components/auth/security-audit"

export default function SecurityAuditPage() {
  return (
    <DashboardLayout>
      <SecurityAudit />
    </DashboardLayout>
  )
}

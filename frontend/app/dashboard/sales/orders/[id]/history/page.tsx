"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { distributionApi } from "@/services"
import { formatDateISO } from "@/lib/utils"

type StatusHistoryRow = {
  id: number
  fromStatus?: string | null
  toStatus: string
  changedBy?: number
  reason?: string
  changedAt: string
}

type AuditRow = {
  id: number
  action: "INSERT" | "UPDATE" | "DELETE"
  actorId?: number
  changedFields?: string[] | null
  createdAt: string
}

export default function SalesOrderHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [statusHistory, setStatusHistory] = useState<StatusHistoryRow[]>([])
  const [audit, setAudit] = useState<AuditRow[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await distributionApi.getSalesOrderHistory(id)
        const payload = (res.data ?? {}) as { statusHistory?: StatusHistoryRow[]; audit?: AuditRow[] }
        setStatusHistory(payload.statusHistory ?? [])
        setAudit(payload.audit ?? [])
      } finally {
        setLoading(false)
      }
    }
    if (id) void run()
  }, [id])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales order history</h1>
            <p className="text-muted-foreground">Status timeline and immutable audit rows for SO #{id}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/sales/orders")}>
            Back to sales orders
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="text-muted-foreground">Loading history...</div>}
            {!loading && statusHistory.length === 0 && (
              <div className="text-muted-foreground">No status transitions recorded yet.</div>
            )}
            {statusHistory.map((row) => (
              <div key={row.id} className="rounded border p-3 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div>
                    {row.fromStatus ? (
                      <>
                        <Badge variant="outline">{row.fromStatus}</Badge> {" -> "} <Badge>{row.toStatus}</Badge>
                      </>
                    ) : (
                      <Badge>{row.toStatus}</Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    By user {row.changedBy ?? "N/A"} {row.reason ? `- ${row.reason}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(row.changedAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log (immutable)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!loading && audit.length === 0 && <div className="text-muted-foreground">No audit rows yet.</div>}
            {audit.map((row) => (
              <div key={row.id} className="rounded border p-3 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{row.action}</div>
                  <div className="text-muted-foreground">
                    Actor: {row.actorId ?? "N/A"}
                    {row.changedFields?.length ? ` | Fields: ${row.changedFields.join(", ")}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(row.createdAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { distributionApi } from "@/services"
import { formatDateISO } from "@/lib/utils"

type Row = {
  id: number
  entityType: string
  entityId: number
  action?: string
  fromStatus?: string | null
  toStatus?: string
  actorId?: number
  changedBy?: number
  changedFields?: string[] | null
  createdAt?: string
  changedAt?: string
}

export default function ShipmentHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [audit, setAudit] = useState<Row[]>([])
  const [shipmentStatusHistory, setShipmentStatusHistory] = useState<Row[]>([])
  const [itemStatusHistory, setItemStatusHistory] = useState<Row[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await distributionApi.getShipmentHistory(id)
        const data = (res.data ?? {}) as {
          audit?: Row[]
          shipmentStatusHistory?: Row[]
          itemStatusHistory?: Row[]
        }
        setAudit(data.audit ?? [])
        setShipmentStatusHistory(data.shipmentStatusHistory ?? [])
        setItemStatusHistory(data.itemStatusHistory ?? [])
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
            <h1 className="text-3xl font-bold tracking-tight">Shipment history</h1>
            <p className="text-muted-foreground">Immutable audit and status transitions for shipment #{id}</p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/dashboard/sales/shipments/${id}`)}>
            Back to shipment
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Shipment status timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading && <div className="text-muted-foreground">Loading history...</div>}
            {!loading && shipmentStatusHistory.length === 0 && <div className="text-muted-foreground">No shipment status history.</div>}
            {shipmentStatusHistory.map((r) => (
              <div key={r.id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  {r.fromStatus ? <><Badge variant="outline">{r.fromStatus}</Badge> {" -> "} <Badge>{r.toStatus}</Badge></> : <Badge>{r.toStatus}</Badge>}
                  <div className="text-muted-foreground mt-1">By user {r.changedBy ?? "N/A"}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(r.changedAt || "")}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Item status timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!loading && itemStatusHistory.length === 0 && <div className="text-muted-foreground">No item status history.</div>}
            {itemStatusHistory.map((r) => (
              <div key={r.id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Item #{r.entityId}</span>{" "}
                  {r.fromStatus ? <><Badge variant="outline">{r.fromStatus}</Badge> {" -> "} <Badge>{r.toStatus}</Badge></> : <Badge>{r.toStatus}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(r.changedAt || "")}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Audit log</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!loading && audit.length === 0 && <div className="text-muted-foreground">No audit rows.</div>}
            {audit.map((r) => (
              <div key={r.id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{r.entityType}</span> #{r.entityId} - {r.action}
                  <div className="text-muted-foreground">Actor: {r.actorId ?? "N/A"} {r.changedFields?.length ? `| Fields: ${r.changedFields.join(", ")}` : ""}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(r.createdAt || "")}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


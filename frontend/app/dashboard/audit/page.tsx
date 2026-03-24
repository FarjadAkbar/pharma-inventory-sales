"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { distributionApi } from "@/services"
import { formatDateISO } from "@/lib/utils"

type AuditRow = {
  id: number
  entityType: string
  entityId: number
  action: string
  actorId?: number
  changedFields?: string[] | null
  createdAt: string
}

type StatusRow = {
  id: number
  entityType: string
  entityId: number
  fromStatus?: string | null
  toStatus: string
  changedBy?: number
  changedAt: string
}

const ENTITY_TYPES = ["sales_order", "shipment", "shipment_item", "proof_of_delivery"] as const

export default function AuditPage() {
  const [entityType, setEntityType] = useState<string>(ENTITY_TYPES[0])
  const [entityId, setEntityId] = useState("")
  const [loading, setLoading] = useState(false)
  const [audit, setAudit] = useState<AuditRow[]>([])
  const [statusHistory, setStatusHistory] = useState<StatusRow[]>([])

  const fetchHistory = async () => {
    if (!entityId) return
    try {
      setLoading(true)
      const res = await distributionApi.getEntityAuditHistory(entityType, entityId)
      const data = (res.data ?? {}) as { audit?: AuditRow[]; statusHistory?: StatusRow[] }
      setAudit(data.audit ?? [])
      setStatusHistory(data.statusHistory ?? [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit trail</h1>
          <p className="text-muted-foreground">Generic entity history by entity type + id</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Lookup</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Entity type</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Entity id</Label>
              <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="e.g. 1" />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchHistory} disabled={loading || !entityId}>{loading ? "Loading..." : "View history"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status history</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {statusHistory.length === 0 && <div className="text-muted-foreground">No status rows.</div>}
            {statusHistory.map((r) => (
              <div key={r.id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  {r.fromStatus ? <><Badge variant="outline">{r.fromStatus}</Badge> {" -> "} <Badge>{r.toStatus}</Badge></> : <Badge>{r.toStatus}</Badge>}
                  <div className="text-muted-foreground">By user {r.changedBy ?? "N/A"}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(r.changedAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Audit logs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {audit.length === 0 && <div className="text-muted-foreground">No audit rows.</div>}
            {audit.map((r) => (
              <div key={r.id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{r.action}</span> ({r.entityType} #{r.entityId})
                  <div className="text-muted-foreground">Actor: {r.actorId ?? "N/A"} {r.changedFields?.length ? `| Fields: ${r.changedFields.join(", ")}` : ""}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateISO(r.createdAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


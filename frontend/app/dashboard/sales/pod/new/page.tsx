"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Signature, Thermometer } from "lucide-react"
import { distributionApi } from "@/services"
import { toast } from "sonner"

export default function NewPODPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [shipments, setShipments] = useState<any[]>([])
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [formData, setFormData] = useState({
    shipmentId: "",
    salesOrderId: "",
    accountId: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveredByName: "",
    receivedByName: "",
    receivedByTitle: "",
    deliveryStatus: "Delivered",
    conditionAtDelivery: "Good",
    temperatureAtDelivery: 0,
    signature: "",
    notes: "",
  })

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [shipmentsRes, ordersRes] = await Promise.all([
          distributionApi.getShipments({ page: 1, limit: 200 }).catch(() => null),
          distributionApi.getSalesOrders({ page: 1, limit: 200 }).catch(() => null),
        ])

        if (shipmentsRes?.success && shipmentsRes.data) {
          const raw = shipmentsRes.data as any
          const list = raw?.data ?? raw?.shipments ?? (Array.isArray(raw) ? raw : [])
          setShipments(Array.isArray(list) ? list : [])
        }

        if (ordersRes?.success && ordersRes.data) {
          const raw = ordersRes.data as any
          const list = raw?.data ?? raw?.salesOrders ?? (Array.isArray(raw) ? raw : [])
          setSalesOrders(Array.isArray(list) ? list : [])
        }
      } catch (e) {
        console.error("Failed to load POD dropdown options:", e)
        toast.error("Failed to load POD options")
      } finally {
        setLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const customers = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    salesOrders.forEach((o: any) => {
      const id = o.accountId != null ? String(o.accountId) : ""
      if (!id) return
      const name = o.accountName ?? `Customer ${id}`
      if (!map.has(id)) map.set(id, { id, name })
    })
    return Array.from(map.values())
  }, [salesOrders])

  const handleShipmentChange = (shipmentId: string) => {
    const shipment = shipments.find((s) => String(s.id) === shipmentId)
    setFormData((p) => ({
      ...p,
      shipmentId,
      salesOrderId: shipment?.salesOrderId != null ? String(shipment.salesOrderId) : p.salesOrderId,
      accountId: shipment?.accountId != null ? String(shipment.accountId) : p.accountId,
    }))
  }

  const handleSalesOrderChange = (salesOrderId: string) => {
    const order = salesOrders.find((o) => String(o.id) === salesOrderId)
    setFormData((p) => ({
      ...p,
      salesOrderId,
      accountId: order?.accountId != null ? String(order.accountId) : p.accountId,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        shipmentId: parseInt(formData.shipmentId),
        salesOrderId: parseInt(formData.salesOrderId),
        accountId: parseInt(formData.accountId),
        temperatureAtDelivery: Number(formData.temperatureAtDelivery),
      }
      const response = await distributionApi.createProofOfDelivery(payload)
      if (response.success) {
        toast.success("Proof of delivery created successfully")
        router.push("/dashboard/sales/pod")
      } else {
        toast.error(response.message || "Failed to create proof of delivery")
      }
    } catch (error) {
      console.error("Error creating proof of delivery:", error)
      toast.error("Failed to create proof of delivery")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Proof of Delivery</h1>
          <p className="text-muted-foreground">
            Record delivery confirmation with receiver details and conditions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              POD Details
            </CardTitle>
            <CardDescription>Enter proof of delivery information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shipment *</label>
                  <Select value={formData.shipmentId} onValueChange={handleShipmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingOptions ? "Loading shipments..." : "Select shipment"} />
                    </SelectTrigger>
                    <SelectContent>
                      {shipments.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.shipmentNumber ?? `Shipment ${s.id}`} — {s.accountName ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sales Order *</label>
                  <Select value={formData.salesOrderId} onValueChange={handleSalesOrderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingOptions ? "Loading sales orders..." : "Select sales order"} />
                    </SelectTrigger>
                    <SelectContent>
                      {salesOrders.map((o: any) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.orderNumber ?? `Order ${o.id}`} — {o.accountName ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer *</label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) => setFormData((p) => ({ ...p, accountId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingOptions ? "Loading customers..." : "Select customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Date *</label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData((p) => ({ ...p, deliveryDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Time *</label>
                  <Input
                    type="time"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData((p) => ({ ...p, deliveryTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivered By *</label>
                  <Input
                    value={formData.deliveredByName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, deliveredByName: e.target.value }))
                    }
                    placeholder="Enter delivery person name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Received By *</label>
                  <Input
                    value={formData.receivedByName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, receivedByName: e.target.value }))
                    }
                    placeholder="Enter receiver name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Receiver Title *</label>
                  <Input
                    value={formData.receivedByTitle}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, receivedByTitle: e.target.value }))
                    }
                    placeholder="Enter receiver title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Status *</label>
                  <Select
                    value={formData.deliveryStatus}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, deliveryStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition at Delivery *</label>
                  <Select
                    value={formData.conditionAtDelivery}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, conditionAtDelivery: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Compromised">Compromised</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Temperature at Delivery (°C)</label>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-blue-600" />
                    <Input
                      type="number"
                      value={formData.temperatureAtDelivery}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          temperatureAtDelivery: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Signature</label>
                  <div className="flex items-center gap-2">
                    <Signature className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.signature}
                      onChange={(e) => setFormData((p) => ({ ...p, signature: e.target.value }))}
                      placeholder="Signature reference or data"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any additional notes about the delivery"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/sales/pod")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Create POD"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


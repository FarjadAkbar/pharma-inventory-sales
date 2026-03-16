"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart } from "lucide-react"
import { masterDataApi, sitesApi, distributionApi } from "@/services"
import { toast } from "sonner"
import { UNIT_OPTIONS } from "@/lib/constants"

interface OrderItem {
  drugId: string
  drugName: string
  quantity: number
  unit: string
  price: number
  totalPrice: number
}

export default function EditSalesOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [drugs, setDrugs] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [formData, setFormData] = useState({
    accountId: "",
    accountName: "",
    accountCode: "",
    siteId: "",
    siteName: "",
    requestedShipDate: "",
    status: "Draft",
    priority: "Normal",
    specialInstructions: "",
    currency: "PKR",
  })
  const [items, setItems] = useState<OrderItem[]>([])

  const computedTotalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    [items],
  )

  useEffect(() => {
    Promise.all([
      masterDataApi.getDrugs().catch(() => ({ data: [] })),
      sitesApi.getSites().catch(() => ({ data: [] })),
    ]).then(([drugsRes, sitesRes]) => {
      if (drugsRes?.data) {
        const drugsList = (drugsRes.data as any).drugs ?? drugsRes.data
        setDrugs(Array.isArray(drugsList) ? drugsList : [])
      } else if (Array.isArray(drugsRes)) {
        setDrugs(drugsRes)
      }

      if (sitesRes?.data) setSites(Array.isArray(sitesRes.data) ? sitesRes.data : [])
      else if (Array.isArray(sitesRes)) setSites(sitesRes)
    })
  }, [])

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoadingOrder(true)
        const res = await distributionApi.getSalesOrder(id)
        if (!res?.success || !res.data) throw new Error(res?.message || "Failed to load sales order")

        const raw = res.data as any
        const order = raw?.data ?? raw

        setFormData({
          accountId: order.accountId != null ? String(order.accountId) : "",
          accountName: order.accountName ?? "",
          accountCode: order.accountCode ?? "",
          siteId: order.siteId != null ? String(order.siteId) : "",
          siteName: order.siteName ?? "",
          requestedShipDate: (order.requestedShipDate ?? "").toString().split("T")[0],
          status: order.status ?? "Draft",
          priority: order.priority ?? "Normal",
          specialInstructions: order.specialInstructions ?? "",
          currency: order.currency ?? "PKR",
        })

        const orderItems = Array.isArray(order.items) ? order.items : []
        setItems(
          orderItems.map((it: any) => ({
            drugId: it.drugId != null ? String(it.drugId) : "",
            drugName: it.drugName ?? "",
            quantity: Number(it.quantity) || 0,
            unit: it.unit ?? "",
            price: Number(it.unitPrice ?? it.price) || 0,
            totalPrice: Number(it.totalPrice) || (Number(it.quantity) || 0) * (Number(it.unitPrice ?? it.price) || 0),
          })),
        )
      } catch (e) {
        console.error("Failed to load sales order:", e)
        toast.error("Failed to load sales order")
        router.push("/dashboard/sales/orders")
      } finally {
        setLoadingOrder(false)
      }
    }
    if (id) loadOrder()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedSite = sites.find((s) => s.id.toString() === formData.siteId)

      // Keep existing addresses on backend if supported; if required, backend should merge.
      const response = await distributionApi.updateSalesOrder(id, {
        accountId: parseInt(formData.accountId),
        accountName: formData.accountName || "Customer Account",
        accountCode: formData.accountCode || `ACC-${formData.accountId}`,
        siteId: parseInt(formData.siteId),
        siteName: selectedSite?.name || formData.siteName || "Site",
        requestedShipDate: formData.requestedShipDate,
        status: formData.status,
        priority: formData.priority,
        totalAmount: computedTotalAmount,
        currency: formData.currency,
        specialInstructions: formData.specialInstructions || undefined,
        items: items.map((item) => {
          const drug = drugs.find((d) => d.id.toString() === item.drugId)
          return {
            drugId: parseInt(item.drugId),
            drugName: drug?.name || item.drugName || "Drug",
            drugCode: drug?.code || `DRUG-${item.drugId}`,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.price,
            totalPrice: item.totalPrice,
          }
        }),
      })

      if (response.success) {
        toast.success("Sales order updated successfully")
        router.push("/dashboard/sales/orders")
      } else {
        toast.error(response.message || "Failed to update sales order")
      }
    } catch (error) {
      console.error("Error updating sales order:", error)
      toast.error("Failed to update sales order")
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { drugId: "", drugName: "", quantity: 0, unit: "", price: 0, totalPrice: 0 },
    ])
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const updated: OrderItem = { ...item, [field]: value } as any
        if (field === "quantity" || field === "price") {
          updated.totalPrice = updated.quantity * updated.price
        }
        return updated
      }),
    )
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  if (loadingOrder) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Sales Order</h1>
            <p className="text-muted-foreground">Update customer, shipping, and order items.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Sales Order Details
            </CardTitle>
            <CardDescription>Edit the sales order details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select value={formData.accountId} onValueChange={(value) => setFormData((p) => ({ ...p, accountId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ziauddin Hospital - Clifton</SelectItem>
                      <SelectItem value="2">Aga Khan University Hospital</SelectItem>
                      <SelectItem value="3">Liaquat National Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Site *</Label>
                  <Select
                    value={formData.siteId}
                    onValueChange={(value) => {
                      const site = sites.find((s) => s.id.toString() === value)
                      setFormData((p) => ({ ...p, siteId: value, siteName: site?.name || "" }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Requested Ship Date *</Label>
                  <Input
                    type="date"
                    value={formData.requestedShipDate}
                    onChange={(e) => setFormData((p) => ({ ...p, requestedShipDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData((p) => ({ ...p, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData((p) => ({ ...p, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Allocated">Allocated</SelectItem>
                      <SelectItem value="Picked">Picked</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={formData.currency} onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Special Instructions</Label>
                  <Textarea value={formData.specialInstructions} onChange={(e) => setFormData((p) => ({ ...p, specialInstructions: e.target.value }))} rows={3} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Order Items</h2>
                  <Button type="button" variant="outline" onClick={addItem}>
                    Add Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-medium">Item {index + 1}</div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select value={item.drugId} onValueChange={(value) => updateItem(index, "drugId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {drugs.map((drug: any) => (
                              <SelectItem key={drug.id} value={drug.id.toString()}>
                                {drug.name} ({drug.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select value={item.unit} onValueChange={(value) => updateItem(index, "unit", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/sales/orders")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Update Sales Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


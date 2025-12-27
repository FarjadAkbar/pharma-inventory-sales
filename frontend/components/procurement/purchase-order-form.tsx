"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calculator, FileText, ShoppingCart, User, Building2, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { purchaseOrdersApi, sitesApi, rawMaterialsApi, suppliersApi } from "@/services"
import { toast } from "@/lib/toast"

interface Site {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

interface RawMaterialOption {
  id: number
  name: string
  code: string
  unitOfMeasure?: string
}

interface PurchaseOrderFormProps {
  purchaseOrderId?: number
  onSuccess: () => void
  onCancel: () => void
}

interface FormItem {
  id?: number
  rawMaterialId: number
  rawMaterialName?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export function PurchaseOrderForm({ purchaseOrderId, onSuccess, onCancel }: PurchaseOrderFormProps) {
  const [formData, setFormData] = useState({
    siteId: 0,
    supplierId: 0,
    status: "Draft" as 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled',
    expectedDate: "",
    note: "",
  })
  const [items, setItems] = useState<FormItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [sites, setSites] = useState<Site[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterialOption[]>([])

  const isEdit = !!purchaseOrderId

  useEffect(() => {
    const loadData = async () => {
      setFetching(true)
      try {
        await Promise.all([
          fetchSites(),
          fetchSuppliers(),
          fetchRawMaterials(),
        ])
        if (isEdit && purchaseOrderId) {
          await fetchPurchaseOrder()
        }
      } finally {
        setFetching(false)
      }
    }
    loadData()
  }, [purchaseOrderId])

  useEffect(() => {
    // Calculate total amount whenever items change
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0)
    // Total is calculated automatically in the backend
  }, [items])

  const fetchSites = async () => {
    try {
      const sitesData = await sitesApi.getSites()
      setSites(sitesData.map((site: any) => ({ id: site.id, name: site.name })))
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const suppliersData = await suppliersApi.getSuppliers()
      setSuppliers(suppliersData.map((supplier: any) => ({ id: supplier.id, name: supplier.name })))
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const materialsData = await rawMaterialsApi.getRawMaterials()
      setRawMaterials(materialsData.map((material: any) => ({
        id: material.id,
        name: material.name,
        code: material.code,
        unitOfMeasure: material.unitOfMeasure,
      })))
    } catch (error) {
      console.error("Failed to fetch raw materials:", error)
    }
  }

  const fetchPurchaseOrder = async () => {
    if (!purchaseOrderId) return
    
    try {
      const order = await purchaseOrdersApi.getPurchaseOrder(purchaseOrderId.toString())
      
      setFormData({
        siteId: order.siteId || 0,
        supplierId: order.supplierId,
        status: order.status,
        expectedDate: new Date(order.expectedDate).toISOString().split('T')[0],
        note: "",
      })
      
      setItems((order.items || []).map(item => ({
        id: item.id,
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterial?.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.totalPrice,
      })))
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
    }
  }

  const addItem = () => {
    const newItem: FormItem = {
      rawMaterialId: 0,
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof FormItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Auto-populate material name when material is selected
    if (field === 'rawMaterialId') {
      const material = rawMaterials.find(m => m.id === value)
      if (material) {
        updatedItems[index].rawMaterialName = material.name
      }
    }
    
    // Calculate line total when quantity or unit_price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].lineTotal = updatedItems[index].quantity * updatedItems[index].unitPrice
    }
    
    setItems(updatedItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.supplierId || !formData.expectedDate) {
      toast.error("Validation Error", "Please fill in all required fields (Supplier and Expected Date)")
      return
    }

    if (items.length === 0) {
      toast.error("Validation Error", "Please add at least one item")
      return
    }

    const hasInvalidItems = items.some(item => 
      !item.rawMaterialId || item.rawMaterialId === 0 || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0
    )

    if (hasInvalidItems) {
      toast.error("Validation Error", "Please fill in all item details correctly")
      return
    }

    setLoading(true)
    try {
      const submitData = {
        supplierId: formData.supplierId,
        siteId: formData.siteId > 0 ? formData.siteId : undefined,
        expectedDate: new Date(formData.expectedDate).toISOString(),
        items: items.map(item => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        status: formData.status,
      }

      if (isEdit && purchaseOrderId) {
        await purchaseOrdersApi.updatePurchaseOrder(purchaseOrderId.toString(), submitData)
        toast.success("Purchase order updated", "The purchase order has been updated successfully.")
      } else {
        await purchaseOrdersApi.createPurchaseOrder(submitData)
        toast.success("Purchase order created", "The purchase order has been created successfully.")
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save purchase order. Please try again."
      toast.error("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0)

  if (fetching) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter supplier, site, and order details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="supplier_id" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Supplier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.supplierId > 0 ? formData.supplierId.toString() : undefined}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: parseInt(value) })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="site_id" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Site <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Select
                  value={formData.siteId > 0 ? formData.siteId.toString() : "0"}
                  onValueChange={(value) => setFormData({ ...formData, siteId: value && value !== "0" ? parseInt(value) : 0 })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select site (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="expected_date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expected Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expected_date"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

      {/* Items Section Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Items
          </CardTitle>
          <CardDescription>
            Add raw materials and quantities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Raw Material</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Unit Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Line Total</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <Select
                              value={item.rawMaterialId > 0 ? item.rawMaterialId.toString() : undefined}
                              onValueChange={(value) => updateItem(index, 'rawMaterialId', parseInt(value))}
                            >
                              <SelectTrigger className="w-full min-w-[200px]">
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                {rawMaterials.map((material) => (
                                  <SelectItem key={material.id} value={material.id.toString()}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{material.code}</span>
                                      <span className="text-xs text-muted-foreground">{material.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-32"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-sm font-mono">
                              {item.lineTotal.toFixed(2)} PKR
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No items added yet</p>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus  />
                  Add First Item
                </Button>
              </div>
            )}
            
            <Button 
              type="button" 
              onClick={addItem} 
              variant="outline" 
              className="w-full"
            >
              <Plus  />
              Add Another Item
            </Button>
          </CardContent>
        </Card>

        {/* Summary Card - Sticky at bottom */}
        <Card className="sticky bottom-0 bg-background border-t-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {totalAmount.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} PKR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEdit ? "Update Order" : "Create Order"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

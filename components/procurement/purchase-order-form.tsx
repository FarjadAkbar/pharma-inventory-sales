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
import { Plus, Trash2, Calculator } from "lucide-react"
import { purchaseOrdersApi, sitesApi, rawMaterialsApi } from "@/services"
import type { 
  PurchaseOrder, 
  CreatePurchaseOrderData, 
  UpdatePurchaseOrderData,
  PurchaseOrderItem 
} from "@/types/purchase-orders"
import type { RawMaterial } from "@/types/raw-materials"

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
  unit_name: string
  unit_id: number
}

interface PurchaseOrderFormProps {
  purchaseOrderId?: number
  onSuccess: () => void
  onCancel: () => void
}

interface FormItem {
  id?: number
  material_id: number
  material_name?: string
  qty: number
  unit_id: number
  unit_name?: string
  unit_price: number
  line_total: number
}

export function PurchaseOrderForm({ purchaseOrderId, onSuccess, onCancel }: PurchaseOrderFormProps) {
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    site_id: 0,
    supplier_id: 0,
    status: "Draft",
    expected_date: "",
    total_amount: 0,
    currency: "USD",
    note: "",
    items: []
  })
  const [items, setItems] = useState<FormItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterialOption[]>([])

  const isEdit = !!purchaseOrderId

  useEffect(() => {
    fetchSites()
    fetchSuppliers()
    fetchRawMaterials()
    if (isEdit && purchaseOrderId) {
      fetchPurchaseOrder()
    }
  }, [purchaseOrderId])

  useEffect(() => {
    // Calculate total amount whenever items change
    const total = items.reduce((sum, item) => sum + item.line_total, 0)
    setFormData(prev => ({ ...prev, total_amount: total }))
  }, [items])

  const fetchSites = async () => {
    try {
      const response = await sitesApi.getSites()
      if (response.status && response.data) {
        setSites(response.data.map((site: any) => ({ id: site.id, name: site.name })))
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await purchaseOrdersApi.getSuppliersList()
      if (response.status && response.data) {
        setSuppliers(response.data.map((supplier: any) => ({ id: supplier.id, name: supplier.name })))
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const response = await rawMaterialsApi.getRawMaterials()
      if (response.status && response.data) {
        const materials = Array.isArray(response.data) ? response.data : [response.data]
        setRawMaterials(materials.map((material: RawMaterial) => ({
          id: material.id,
          name: material.raw_material_name,
          unit_name: material.unit_name,
          unit_id: material.unit_id
        })))
      }
    } catch (error) {
      console.error("Failed to fetch raw materials:", error)
    }
  }

  const fetchPurchaseOrder = async () => {
    if (!purchaseOrderId) return
    
    try {
      const response = await purchaseOrdersApi.getAllPurchaseOrders()
      if (response.status && response.data) {
        const orders = Array.isArray(response.data) ? response.data : [response.data]
        const order = orders.find(po => po.id === purchaseOrderId)
        
        if (order) {
          setFormData({
            site_id: order.site_id,
            supplier_id: order.supplier_id,
            status: order.status,
            expected_date: order.expected_date,
            total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
            currency: order.currency,
            note: order.note,
            items: order.items.map(item => ({
              material_id: item.material_id,
              qty: item.qty,
              unit_id: item.unit_id,
              unit_price: item.unit_price
            }))
          })
          
          setItems(order.items.map(item => ({
            id: item.id,
            material_id: item.material_id,
            material_name: item.material_name,
            qty: item.qty,
            unit_id: item.unit_id,
            unit_name: item.unit_name,
            unit_price: item.unit_price,
            line_total: item.qty * item.unit_price
          })))
        }
      }
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
    }
  }

  const addItem = () => {
    const newItem: FormItem = {
      material_id: 0,
      qty: 1,
      unit_id: 0,
      unit_price: 0,
      line_total: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof FormItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Auto-populate unit when material is selected
    if (field === 'material_id') {
      const material = rawMaterials.find(m => m.id === value)
      if (material) {
        updatedItems[index].unit_id = material.unit_id
        updatedItems[index].unit_name = material.unit_name
        updatedItems[index].material_name = material.name
      }
    }
    
    // Calculate line total when qty or unit_price changes
    if (field === 'qty' || field === 'unit_price') {
      updatedItems[index].line_total = updatedItems[index].qty * updatedItems[index].unit_price
    }
    
    setItems(updatedItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.site_id || !formData.supplier_id || !formData.expected_date) {
      alert("Please fill in all required fields")
      return
    }

    if (items.length === 0) {
      alert("Please add at least one item")
      return
    }

    const hasInvalidItems = items.some(item => 
      !item.material_id || !item.qty || !item.unit_id || !item.unit_price
    )

    if (hasInvalidItems) {
      alert("Please fill in all item details")
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        items: items.map(item => ({
          material_id: item.material_id,
          qty: item.qty,
          unit_id: item.unit_id,
          unit_price: item.unit_price
        }))
      }

      if (isEdit && purchaseOrderId) {
        await purchaseOrdersApi.updatePurchaseOrder(purchaseOrderId, submitData)
      } else {
        await purchaseOrdersApi.createPurchaseOrder(submitData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
      alert("Failed to save purchase order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Purchase Order" : "Create New Purchase Order"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update the purchase order information" : "Enter the details for the new purchase order"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_id">Site *</Label>
              <Select
                className="w-full"
                value={formData.site_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, site_id: parseInt(value) })}
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
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select
                className="w-full"
                value={formData.supplier_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: parseInt(value) })}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                className="w-full"
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_date">Expected Date *</Label>
              <Input
                id="expected_date"
                type="date"
                value={formData.expected_date}
                onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="USD"
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

          <Separator />

          {/* Items Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Material *</Label>
                    <Select
                      className="w-full"
                      value={item.material_id.toString()}
                      onValueChange={(value) => updateItem(index, 'material_id', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={item.unit_name || ""}
                      disabled
                      placeholder="Auto-filled"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Total</Label>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-sm">
                        {item.line_total.toFixed(2)} {formData.currency}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to get started.
              </div>
            )}
          </div>

          <Separator />

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">Total Amount:</span>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {formData.total_amount.toFixed(2)} {formData.currency}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
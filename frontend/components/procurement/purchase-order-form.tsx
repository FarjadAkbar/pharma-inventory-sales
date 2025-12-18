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
import { purchaseOrdersApi, sitesApi, rawMaterialsApi, suppliersApi } from "@/services"

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
      alert("Please fill in all required fields (Supplier and Expected Date)")
      return
    }

    if (items.length === 0) {
      alert("Please add at least one item")
      return
    }

    const hasInvalidItems = items.some(item => 
      !item.rawMaterialId || item.rawMaterialId === 0 || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0
    )

    if (hasInvalidItems) {
      alert("Please fill in all item details correctly")
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
      } else {
        await purchaseOrdersApi.createPurchaseOrder(submitData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save purchase order. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0)

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
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select
                value={formData.supplierId.toString()}
                onValueChange={(value) => setFormData({ ...formData, supplierId: parseInt(value) })}
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
            <div className="space-y-2">
              <Label htmlFor="site_id">Site (Optional)</Label>
              <Select
                value={formData.siteId > 0 ? formData.siteId.toString() : "0"}
                onValueChange={(value) => setFormData({ ...formData, siteId: value && value !== "0" ? parseInt(value) : 0 })}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
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
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_date">Expected Date *</Label>
              <Input
                id="expected_date"
                type="date"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                required
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Raw Material *</Label>
                    <Select
                      value={item.rawMaterialId.toString()}
                      onValueChange={(value) => updateItem(index, 'rawMaterialId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.code} - {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Total</Label>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-sm">
                        {item.lineTotal.toFixed(2)}
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
                  {totalAmount.toFixed(2)}
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

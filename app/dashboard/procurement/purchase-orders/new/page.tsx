"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
  Building2
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { PurchaseOrder, POItem, Supplier, Site } from "@/types/procurement"

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [rawMaterials, setRawMaterials] = useState<any[]>([])

  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    supplierId: "",
    siteId: "",
    expectedDate: "",
    notes: "",
    items: []
  })

  const [newItem, setNewItem] = useState<Partial<POItem>>({
    materialId: "",
    quantity: 0,
    unitId: "1",
    unitPrice: 0
  })

  useEffect(() => {
    fetchSuppliers()
    fetchSites()
    fetchRawMaterials()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers()
      if (response.success && response.data) {
        setSuppliers(response.data.suppliers || [])
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    }
  }

  const fetchSites = async () => {
    try {
      const response = await apiService.getSites()
      if (response.success && response.data) {
        setSites(response.data.sites || [])
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const response = await apiService.getRawMaterials()
      if (response.success && response.data) {
        setRawMaterials(response.data.rawMaterials || [])
      }
    } catch (error) {
      console.error("Failed to fetch raw materials:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplierId) newErrors.supplierId = "Supplier is required"
    if (!formData.siteId) newErrors.siteId = "Site is required"
    if (!formData.expectedDate) newErrors.expectedDate = "Expected date is required"
    if (!formData.items || formData.items.length === 0) newErrors.items = "At least one item is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await apiService.createPurchaseOrder(formData as PurchaseOrder)
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/procurement/purchase-orders")
      }, 2000)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create purchase order" })
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    if (newItem.materialId && newItem.quantity && newItem.unitPrice) {
      const material = rawMaterials.find(rm => rm.id === newItem.materialId)
      const item: POItem = {
        id: Date.now().toString(),
        materialId: newItem.materialId!,
        materialName: material?.name || "",
        materialCode: material?.code || "",
        quantity: newItem.quantity!,
        unitId: newItem.unitId!,
        unitName: "kg", // Default unit
        unitPrice: newItem.unitPrice!,
        totalPrice: newItem.quantity! * newItem.unitPrice!,
        receivedQuantity: 0,
        pendingQuantity: newItem.quantity!,
        status: "Pending"
      }

      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), item]
      }))

      setNewItem({
        materialId: "",
        quantity: 0,
        unitId: "1",
        unitPrice: 0
      })
    }
  }

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }))
  }

  const calculateTotal = () => {
    return formData.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0
  }

  const getSelectedSupplier = () => {
    return suppliers.find(s => s.id === formData.supplierId)
  }

  const getSelectedSite = () => {
    return sites.find(s => s.id === formData.siteId)
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Purchase Order Created!</h2>
                <p className="text-muted-foreground mb-4">
                  The purchase order has been created and is ready for approval.
                </p>
                <Button onClick={() => router.push("/dashboard/procurement/purchase-orders")} className="bg-orange-600 hover:bg-orange-700">
                  View All POs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
            <p className="text-muted-foreground">Create a new purchase order for pharmaceutical materials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Details</CardTitle>
              <CardDescription>Basic information for the purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier *</Label>
                  <Select 
                    value={formData.supplierId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                  >
                    <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteId">Delivery Site *</Label>
                  <Select 
                    value={formData.siteId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value }))}
                  >
                    <SelectTrigger className={errors.siteId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          <div>
                            <div className="font-medium">{site.name}</div>
                            <div className="text-sm text-muted-foreground">{site.address.city}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.siteId && <p className="text-sm text-red-500">{errors.siteId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Expected Delivery Date *</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDate: e.target.value }))}
                    className={errors.expectedDate ? "border-red-500" : ""}
                  />
                  {errors.expectedDate && <p className="text-sm text-red-500">{errors.expectedDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Special instructions or notes..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Purchase Order Items
              </CardTitle>
              <CardDescription>Add materials and quantities to the purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Item */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Material</Label>
                    <Select 
                      value={newItem.materialId} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, materialId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            <div>
                              <div className="font-medium">{material.name}</div>
                              <div className="text-sm text-muted-foreground">{material.code}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity || ""}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      placeholder="Qty"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      value={newItem.unitPrice || ""}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Actions</Label>
                    <Button type="button" onClick={addItem} size="sm" className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {formData.items && formData.items.length > 0 ? (
                <div className="space-y-2">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <div className="font-medium">{item.materialName}</div>
                          <div className="text-sm text-muted-foreground">{item.materialCode}</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{item.quantity} {item.unitName}</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">PKR {item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-sm font-medium text-orange-600">
                          PKR {item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet. Add materials to create the purchase order.</p>
                </div>
              )}

              {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}
            </CardContent>
          </Card>

          {/* Summary */}
          {formData.items && formData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      PKR {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  
                  {getSelectedSupplier() && (
                    <div className="text-sm text-muted-foreground">
                      <div>Supplier: {getSelectedSupplier()?.name}</div>
                      <div>Delivery Time: {getSelectedSupplier()?.deliveryTime} days</div>
                      <div>Payment Terms: {getSelectedSupplier()?.paymentTerms}</div>
                    </div>
                  )}
                  
                  {getSelectedSite() && (
                    <div className="text-sm text-muted-foreground">
                      <div>Delivery Site: {getSelectedSite()?.name}</div>
                      <div>Address: {getSelectedSite()?.address.street}, {getSelectedSite()?.address.city}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

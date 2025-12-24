"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ShoppingCart, User, Calendar, MapPin, DollarSign, Package } from "lucide-react"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"
import { UNIT_OPTIONS } from "@/lib/constants"

interface SalesOrderFormProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

interface OrderItem {
  drugId: string
  drugName: string
  quantity: number
  unit: string
  price: number
  totalPrice: number
}

export function SalesOrderForm({ onSuccess, trigger }: SalesOrderFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    accountId: "",
    siteId: "",
    requestedShipDate: "",
    priority: "Normal",
    specialInstructions: "",
    currency: "PKR"
  })
  const [items, setItems] = useState<OrderItem[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
      
      const response = await apiService.createSalesOrder({
        ...formData,
        items: items.map(item => ({
          drugId: item.drugId,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        totalAmount,
        status: "Draft",
        createdBy: "current-user-id", // This should come from auth context
        createdAt: new Date().toISOString()
      })

      if (response.success) {
        toast.success("Sales order created successfully")
        setOpen(false)
        setFormData({
          accountId: "",
          siteId: "",
          requestedShipDate: "",
          priority: "Normal",
          specialInstructions: "",
          currency: "PKR"
        })
        setItems([])
        onSuccess?.()
      } else {
        toast.error("Failed to create sales order")
      }
    } catch (error) {
      console.error("Error creating sales order:", error)
      toast.error("An error occurred while creating the sales order")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      drugId: "",
      drugName: "",
      quantity: 0,
      unit: "",
      price: 0,
      totalPrice: 0
    }])
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }
        if (field === "quantity" || field === "price") {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.price
        }
        return updatedItem
      }
      return item
    }))
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus />
            New Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Create Sales Order
          </DialogTitle>
          <DialogDescription>
            Create a new sales order with customer information and product details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="accountId">Customer *</Label>
              <Select value={formData.accountId} onValueChange={(value) => handleInputChange("accountId", value)}>
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

            {/* Site */}
            <div className="space-y-2">
              <Label htmlFor="siteId">Shipping Site *</Label>
              <Select value={formData.siteId} onValueChange={(value) => handleInputChange("siteId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Main Warehouse - Karachi</SelectItem>
                  <SelectItem value="2">Distribution Center - Lahore</SelectItem>
                  <SelectItem value="3">Cold Storage - Islamabad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requested Ship Date */}
            <div className="space-y-2">
              <Label htmlFor="requestedShipDate">Requested Ship Date *</Label>
              <Input
                id="requestedShipDate"
                type="date"
                value={formData.requestedShipDate}
                onChange={(e) => handleInputChange("requestedShipDate", e.target.value)}
                required
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
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

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR (Pakistani Rupee)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Order Items</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Drug</Label>
                  <Select value={item.drugId} onValueChange={(value) => {
                    const drugName = value === "1" ? "Paracetamol Tablets" : 
                                   value === "2" ? "Ibuprofen Tablets" : 
                                   value === "3" ? "Aspirin Tablets" : ""
                    updateItem(index, "drugId", value)
                    updateItem(index, "drugName", drugName)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Paracetamol Tablets</SelectItem>
                      <SelectItem value="2">Ibuprofen Tablets</SelectItem>
                      <SelectItem value="3">Aspirin Tablets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={item.unit} onValueChange={(value) => updateItem(index, "unit", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                    placeholder="Price"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <Input
                    value={item.totalPrice.toFixed(2)}
                    disabled
                    placeholder="Total"
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to start.
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              placeholder="Enter any special delivery instructions"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || items.length === 0} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

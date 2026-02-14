"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Truck, Package, MapPin, Calendar, Thermometer } from "lucide-react"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"

interface ShipmentFormProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ShipmentForm({ onSuccess, trigger }: ShipmentFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    salesOrderId: "",
    salesOrderNumber: "",
    accountId: "",
    accountName: "",
    carrier: "",
    serviceType: "",
    trackingNumber: "",
    priority: "Normal",
    shipmentDate: "",
    expectedDeliveryDate: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Pakistan"
    },
    temperatureRequirements: {
      minTemperature: "",
      maxTemperature: "",
      monitoringRequired: false
    },
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.createShipment({
        ...formData,
        temperatureRequirements: {
          ...formData.temperatureRequirements,
          minTemperature: parseFloat(formData.temperatureRequirements.minTemperature),
          maxTemperature: parseFloat(formData.temperatureRequirements.maxTemperature)
        },
        status: "Draft",
        items: [], // This would be populated from the sales order
        createdBy: "current-user-id", // This should come from auth context
        createdAt: new Date().toISOString()
      })

      if (response.success) {
        toast.success("Shipment created successfully")
        setOpen(false)
        setFormData({
          salesOrderId: "",
          salesOrderNumber: "",
          accountId: "",
          accountName: "",
          carrier: "",
          serviceType: "",
          trackingNumber: "",
          priority: "Normal",
          shipmentDate: "",
          expectedDeliveryDate: "",
          shippingAddress: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Pakistan"
          },
          temperatureRequirements: {
            minTemperature: "",
            maxTemperature: "",
            monitoringRequired: false
          },
          notes: ""
        })
        onSuccess?.()
      } else {
        toast.error("Failed to create shipment")
      }
    } catch (error) {
      console.error("Error creating shipment:", error)
      toast.error("An error occurred while creating the shipment")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus />
            New Shipment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Create Shipment
          </DialogTitle>
          <DialogDescription>
            Create a new shipment with carrier information and temperature monitoring
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Order */}
            <div className="space-y-2">
              <Label htmlFor="salesOrderNumber">Sales Order Number *</Label>
              <Input
                id="salesOrderNumber"
                value={formData.salesOrderNumber}
                onChange={(e) => handleInputChange("salesOrderNumber", e.target.value)}
                placeholder="Enter sales order number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesOrderId">Sales Order ID</Label>
              <Input
                id="salesOrderId"
                value={formData.salesOrderId}
                onChange={(e) => handleInputChange("salesOrderId", e.target.value)}
                placeholder="Enter sales order ID"
              />
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="accountId">Customer *</Label>
              <Select value={formData.accountId} onValueChange={(value) => {
                const accountName = value === "1" ? "Ziauddin Hospital - Clifton" : 
                                 value === "2" ? "Aga Khan University Hospital" : 
                                 value === "3" ? "Liaquat National Hospital" : ""
                handleInputChange("accountId", value)
                handleInputChange("accountName", accountName)
              }}>
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

            {/* Carrier */}
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier *</Label>
              <Select value={formData.carrier} onValueChange={(value) => handleInputChange("carrier", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Express Logistics">Express Logistics</SelectItem>
                  <SelectItem value="Fast Track">Fast Track</SelectItem>
                  <SelectItem value="Reliable Transport">Reliable Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Express">Express</SelectItem>
                  <SelectItem value="Overnight">Overnight</SelectItem>
                  <SelectItem value="Same Day">Same Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
                placeholder="Enter tracking number"
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

            {/* Shipment Date */}
            <div className="space-y-2">
              <Label htmlFor="shipmentDate">Shipment Date *</Label>
              <Input
                id="shipmentDate"
                type="date"
                value={formData.shipmentDate}
                onChange={(e) => handleInputChange("shipmentDate", e.target.value)}
                required
              />
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="expectedDeliveryDate">Expected Delivery Date *</Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleInputChange("expectedDeliveryDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Shipping Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.shippingAddress.street}
                  onChange={(e) => handleInputChange("shippingAddress.street", e.target.value)}
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange("shippingAddress.city", e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleInputChange("shippingAddress.state", e.target.value)}
                  placeholder="Enter state/province"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.shippingAddress.postalCode}
                  onChange={(e) => handleInputChange("shippingAddress.postalCode", e.target.value)}
                  placeholder="Enter postal code"
                  required
                />
              </div>
            </div>
          </div>

          {/* Temperature Requirements */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Temperature Requirements</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTemperature">Min Temperature (°C)</Label>
                <Input
                  id="minTemperature"
                  type="number"
                  step="0.1"
                  value={formData.temperatureRequirements.minTemperature}
                  onChange={(e) => handleInputChange("temperatureRequirements.minTemperature", e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTemperature">Max Temperature (°C)</Label>
                <Input
                  id="maxTemperature"
                  type="number"
                  step="0.1"
                  value={formData.temperatureRequirements.maxTemperature}
                  onChange={(e) => handleInputChange("temperatureRequirements.maxTemperature", e.target.value)}
                  placeholder="e.g., 8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitoringRequired">Monitoring Required</Label>
                <Select 
                  value={formData.temperatureRequirements.monitoringRequired ? "true" : "false"} 
                  onValueChange={(value) => handleInputChange("temperatureRequirements.monitoringRequired", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select monitoring" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Package, MapPin, Calendar, User, AlertCircle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"
import { UNIT_OPTIONS } from "@/lib/constants"

interface InventoryMovementFormProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function InventoryMovementForm({ onSuccess, trigger }: InventoryMovementFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    movementType: "",
    materialId: "",
    batchNumber: "",
    quantity: "",
    unit: "",
    fromLocation: "",
    toLocation: "",
    fromZone: "",
    toZone: "",
    fromRack: "",
    toRack: "",
    fromShelf: "",
    toShelf: "",
    fromPosition: "",
    toPosition: "",
    reason: "",
    referenceDocument: "",
    referenceNumber: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.createMovementRecord({
        ...formData,
        quantity: parseFloat(formData.quantity),
        performedBy: "current-user-id", // This should come from auth context
        performedAt: new Date().toISOString()
      })

      if (response.success) {
        toast.success("Movement record created successfully")
        setOpen(false)
        setFormData({
          movementType: "",
          materialId: "",
          batchNumber: "",
          quantity: "",
          unit: "",
          fromLocation: "",
          toLocation: "",
          fromZone: "",
          toZone: "",
          fromRack: "",
          toRack: "",
          fromShelf: "",
          toShelf: "",
          fromPosition: "",
          toPosition: "",
          reason: "",
          referenceDocument: "",
          referenceNumber: "",
          notes: ""
        })
        onSuccess?.()
      } else {
        toast.error("Failed to create movement record")
      }
    } catch (error) {
      console.error("Error creating movement record:", error)
      toast.error("An error occurred while creating the movement record")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus />
            New Movement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Inventory Movement
          </DialogTitle>
          <DialogDescription>
            Record a new inventory movement with complete traceability
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movement Type */}
            <div className="space-y-2">
              <Label htmlFor="movementType">Movement Type *</Label>
              <Select value={formData.movementType} onValueChange={(value) => handleInputChange("movementType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receipt">Receipt</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Consumption">Consumption</SelectItem>
                  <SelectItem value="Shipment">Shipment</SelectItem>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                  <SelectItem value="Cycle Count">Cycle Count</SelectItem>
                  <SelectItem value="Putaway">Putaway</SelectItem>
                  <SelectItem value="Picking">Picking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Material */}
            <div className="space-y-2">
              <Label htmlFor="materialId">Material *</Label>
              <Select value={formData.materialId} onValueChange={(value) => handleInputChange("materialId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Paracetamol API</SelectItem>
                  <SelectItem value="2">Microcrystalline Cellulose</SelectItem>
                  <SelectItem value="3">Sodium Starch Glycolate</SelectItem>
                  <SelectItem value="4">Paracetamol Tablets</SelectItem>
                  <SelectItem value="5">Ibuprofen Tablets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Batch Number */}
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number *</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                placeholder="Enter batch number"
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
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

            {/* From Location */}
            <div className="space-y-2">
              <Label htmlFor="fromLocation">From Location *</Label>
              <Input
                id="fromLocation"
                value={formData.fromLocation}
                onChange={(e) => handleInputChange("fromLocation", e.target.value)}
                placeholder="Enter source location"
                required
              />
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label htmlFor="toLocation">To Location *</Label>
              <Input
                id="toLocation"
                value={formData.toLocation}
                onChange={(e) => handleInputChange("toLocation", e.target.value)}
                placeholder="Enter destination location"
                required
              />
            </div>

            {/* From Zone */}
            <div className="space-y-2">
              <Label htmlFor="fromZone">From Zone</Label>
              <Select value={formData.fromZone} onValueChange={(value) => handleInputChange("fromZone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Zone A (Raw Materials)</SelectItem>
                  <SelectItem value="B">Zone B (Finished Goods)</SelectItem>
                  <SelectItem value="C">Zone C (Quarantine)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* To Zone */}
            <div className="space-y-2">
              <Label htmlFor="toZone">To Zone</Label>
              <Select value={formData.toZone} onValueChange={(value) => handleInputChange("toZone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Zone A (Raw Materials)</SelectItem>
                  <SelectItem value="B">Zone B (Finished Goods)</SelectItem>
                  <SelectItem value="C">Zone C (Quarantine)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rack Positions */}
            <div className="space-y-2">
              <Label htmlFor="fromRack">From Rack-Shelf-Position</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="fromRack"
                  value={formData.fromRack}
                  onChange={(e) => handleInputChange("fromRack", e.target.value)}
                  placeholder="Rack"
                />
                <Input
                  value={formData.fromShelf}
                  onChange={(e) => handleInputChange("fromShelf", e.target.value)}
                  placeholder="Shelf"
                />
                <Input
                  value={formData.fromPosition}
                  onChange={(e) => handleInputChange("fromPosition", e.target.value)}
                  placeholder="Position"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toRack">To Rack-Shelf-Position</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="toRack"
                  value={formData.toRack}
                  onChange={(e) => handleInputChange("toRack", e.target.value)}
                  placeholder="Rack"
                />
                <Input
                  value={formData.toShelf}
                  onChange={(e) => handleInputChange("toShelf", e.target.value)}
                  placeholder="Shelf"
                />
                <Input
                  value={formData.toPosition}
                  onChange={(e) => handleInputChange("toPosition", e.target.value)}
                  placeholder="Position"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Enter movement reason"
                required
              />
            </div>

            {/* Reference Document */}
            <div className="space-y-2">
              <Label htmlFor="referenceDocument">Reference Document</Label>
              <Input
                id="referenceDocument"
                value={formData.referenceDocument}
                onChange={(e) => handleInputChange("referenceDocument", e.target.value)}
                placeholder="e.g., PO, WO, GRN"
              />
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
                placeholder="Enter reference number"
              />
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
              {loading ? "Creating..." : "Create Movement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
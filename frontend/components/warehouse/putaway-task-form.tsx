"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Package, MapPin, User, AlertCircle, Thermometer } from "lucide-react"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"
import { UNIT_OPTIONS } from "@/lib/constants"

interface PutawayTaskFormProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function PutawayTaskForm({ onSuccess, trigger }: PutawayTaskFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    grnId: "",
    grnNumber: "",
    materialId: "",
    batchNumber: "",
    quantity: "",
    unit: "",
    sourceLocation: "",
    targetLocation: "",
    priority: "Normal",
    assignedTo: "",
    temperatureCompliance: true,
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.createPutawayTask({
        ...formData,
        quantity: parseFloat(formData.quantity),
        assignedAt: new Date().toISOString(),
        status: "Pending"
      })

      if (response.success) {
        toast.success("Putaway task created successfully")
        setOpen(false)
        setFormData({
          grnId: "",
          grnNumber: "",
          materialId: "",
          batchNumber: "",
          quantity: "",
          unit: "",
          sourceLocation: "",
          targetLocation: "",
          priority: "Normal",
          assignedTo: "",
          temperatureCompliance: true,
          notes: ""
        })
        onSuccess?.()
      } else {
        toast.error("Failed to create putaway task")
      }
    } catch (error) {
      console.error("Error creating putaway task:", error)
      toast.error("An error occurred while creating the putaway task")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Putaway Task
          </DialogTitle>
          <DialogDescription>
            Create a new putaway task with location assignment and temperature compliance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GRN Information */}
            <div className="space-y-2">
              <Label htmlFor="grnNumber">GRN Number *</Label>
              <Input
                id="grnNumber"
                value={formData.grnNumber}
                onChange={(e) => handleInputChange("grnNumber", e.target.value)}
                placeholder="Enter GRN number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grnId">GRN ID</Label>
              <Input
                id="grnId"
                value={formData.grnId}
                onChange={(e) => handleInputChange("grnId", e.target.value)}
                placeholder="Enter GRN ID"
              />
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

            {/* Source Location */}
            <div className="space-y-2">
              <Label htmlFor="sourceLocation">Source Location *</Label>
              <Input
                id="sourceLocation"
                value={formData.sourceLocation}
                onChange={(e) => handleInputChange("sourceLocation", e.target.value)}
                placeholder="Enter source location"
                required
              />
            </div>

            {/* Target Location */}
            <div className="space-y-2">
              <Label htmlFor="targetLocation">Target Location *</Label>
              <Input
                id="targetLocation"
                value={formData.targetLocation}
                onChange={(e) => handleInputChange("targetLocation", e.target.value)}
                placeholder="Enter target location"
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
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To *</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">Mr. Muhammad Ali</SelectItem>
                  <SelectItem value="9">Ms. Fatima Hassan</SelectItem>
                  <SelectItem value="10">Mr. Ahmed Khan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Temperature Compliance */}
            <div className="space-y-2">
              <Label htmlFor="temperatureCompliance">Temperature Compliance</Label>
              <Select 
                value={formData.temperatureCompliance ? "true" : "false"} 
                onValueChange={(value) => handleInputChange("temperatureCompliance", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select compliance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Compliant</SelectItem>
                  <SelectItem value="false">Non-compliant</SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

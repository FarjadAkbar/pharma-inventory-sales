"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, CheckCircle, MapPin, User, Calendar, BarChart3 } from "lucide-react"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"

interface CycleCountFormProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CycleCountForm({ onSuccess, trigger }: CycleCountFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    countType: "",
    zone: "",
    assignedTo: "",
    scheduledDate: "",
    totalItems: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.createCycleCount({
        ...formData,
        totalItems: parseInt(formData.totalItems),
        countedItems: 0,
        varianceItems: 0,
        status: "Scheduled",
        scheduledDate: new Date(formData.scheduledDate).toISOString()
      })

      if (response.success) {
        toast.success("Cycle count created successfully")
        setOpen(false)
        setFormData({
          countType: "",
          zone: "",
          assignedTo: "",
          scheduledDate: "",
          totalItems: "",
          notes: ""
        })
        onSuccess?.()
      } else {
        toast.error("Failed to create cycle count")
      }
    } catch (error) {
      console.error("Error creating cycle count:", error)
      toast.error("An error occurred while creating the cycle count")
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
            New Cycle Count
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Create Cycle Count
          </DialogTitle>
          <DialogDescription>
            Schedule a new inventory cycle count with variance reporting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Count Type */}
            <div className="space-y-2">
              <Label htmlFor="countType">Count Type *</Label>
              <Select value={formData.countType} onValueChange={(value) => handleInputChange("countType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select count type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Count">Full Count</SelectItem>
                  <SelectItem value="Partial Count">Partial Count</SelectItem>
                  <SelectItem value="ABC Count">ABC Count</SelectItem>
                  <SelectItem value="Random Count">Random Count</SelectItem>
                  <SelectItem value="Location Count">Location Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zone */}
            <div className="space-y-2">
              <Label htmlFor="zone">Zone *</Label>
              <Select value={formData.zone} onValueChange={(value) => handleInputChange("zone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Zone A (Raw Materials)</SelectItem>
                  <SelectItem value="B">Zone B (Finished Goods)</SelectItem>
                  <SelectItem value="C">Zone C (Quarantine)</SelectItem>
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

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                required
              />
            </div>

            {/* Total Items */}
            <div className="space-y-2">
              <Label htmlFor="totalItems">Total Items *</Label>
              <Input
                id="totalItems"
                type="number"
                value={formData.totalItems}
                onChange={(e) => handleInputChange("totalItems", e.target.value)}
                placeholder="Enter total number of items"
                required
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
              placeholder="Enter any additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Creating..." : "Create Cycle Count"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

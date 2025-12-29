"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormInput, FormActions } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"
import type { Batch } from "@/types/manufacturing"

interface FinishedGoodsReceiptFormProps {
  batchId: string
  batch: Batch
  onSuccess?: () => void
}

export function FinishedGoodsReceiptForm({ batchId, batch, onSuccess }: FinishedGoodsReceiptFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: batch.actualQuantity?.toString() || batch.plannedQuantity.toString(),
    unit: batch.unit,
    batchNumber: `FG-${batch.batchNumber}`,
    expiryDate: "",
    temperature: "",
    humidity: "",
    remarks: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await manufacturingApi.receiveFinishedGoods(batchId, {
        ...formData,
        quantity: parseFloat(formData.quantity),
        expiryDate: formData.expiryDate || undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        humidity: formData.humidity ? parseFloat(formData.humidity) : undefined,
        receivedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Finished goods received. Putaway item created.")
        onSuccess?.()
      } else {
        toast.error(response.message || "Failed to receive finished goods")
      }
    } catch (error) {
      console.error("Error receiving finished goods:", error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <FormInput
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <FormInput
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber">Finished Goods Batch Number *</Label>
          <FormInput
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <FormInput
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <FormInput
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="humidity">Humidity (%)</Label>
            <FormInput
              id="humidity"
              type="number"
              step="0.1"
              value={formData.humidity}
              onChange={(e) => setFormData(prev => ({ ...prev, humidity: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            rows={3}
          />
        </div>

        <FormActions>
          <Button type="submit" disabled={loading}>
            Receive Finished Goods
          </Button>
        </FormActions>
      </div>
    </Form>
  )
}


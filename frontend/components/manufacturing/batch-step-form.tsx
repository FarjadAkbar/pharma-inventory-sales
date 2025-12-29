"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"

interface BatchStepFormProps {
  batchId: string
  onSuccess?: () => void
}

export function BatchStepForm({ batchId, onSuccess }: BatchStepFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    stepNumber: "",
    stepName: "",
    instruction: "",
    description: "",
    status: "Completed",
    remarks: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await manufacturingApi.executeBatchStep(batchId, {
        ...formData,
        stepNumber: parseInt(formData.stepNumber),
        performedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Batch step executed")
        onSuccess?.()
        setFormData({
          stepNumber: "",
          stepName: "",
          instruction: "",
          description: "",
          status: "Completed",
          remarks: "",
        })
      } else {
        toast.error(response.message || "Failed to execute step")
      }
    } catch (error) {
      console.error("Error executing step:", error)
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
            <Label htmlFor="stepNumber">Step Number *</Label>
            <FormInput
              id="stepNumber"
              type="number"
              min="1"
              value={formData.stepNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, stepNumber: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <FormSelect
              id="status"
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Skipped">Skipped</option>
              <option value="Failed">Failed</option>
            </FormSelect>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stepName">Step Name *</Label>
          <FormInput
            id="stepName"
            value={formData.stepName}
            onChange={(e) => setFormData(prev => ({ ...prev, stepName: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instruction">Instruction *</Label>
          <Textarea
            id="instruction"
            value={formData.instruction}
            onChange={(e) => setFormData(prev => ({ ...prev, instruction: e.target.value }))}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            rows={2}
          />
        </div>

        <FormActions>
          <Button type="submit" disabled={loading}>
            Execute Step
          </Button>
        </FormActions>
      </div>
    </Form>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/services/api.service"
import { masterDataApi, sitesApi } from "@/services"
import type { WorkOrder, WorkOrderStatus, ManufacturingPriority } from "@/types/manufacturing"

interface WorkOrderFormProps {
  initialData?: Partial<WorkOrder>
  onSubmit: (data: Partial<WorkOrder>) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
}

export function WorkOrderForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Save Work Order",
}: WorkOrderFormProps) {
  const [drugs, setDrugs] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [formData, setFormData] = useState({
    drugId: initialData?.drugId?.toString() || "",
    drugName: initialData?.drugName || "",
    drugCode: initialData?.drugCode || "",
    siteId: initialData?.siteId?.toString() || "",
    siteName: initialData?.siteName || "",
    plannedQuantity: initialData?.plannedQuantity?.toString() || "",
    unit: initialData?.unit || "",
    bomVersion: initialData?.bomVersion?.toString() || "1",
    status: (initialData?.status as string) || "Draft",
    priority: (initialData?.priority as string) || "Normal",
    plannedStartDate: initialData?.plannedStartDate 
      ? new Date(initialData.plannedStartDate).toISOString().split('T')[0]
      : "",
    plannedEndDate: initialData?.plannedEndDate
      ? new Date(initialData.plannedEndDate).toISOString().split('T')[0]
      : "",
    assignedTo: initialData?.assignedTo?.toString() || "",
    remarks: initialData?.remarks || "",
  })

  useEffect(() => {
    // Fetch drugs and sites
    Promise.all([
      masterDataApi.getDrugs().catch(() => ({ data: [] })),
      sitesApi.getSites().catch(() => ({ data: [] })),
    ]).then(([drugsRes, sitesRes]) => {
      // Handle different response formats
      if (drugsRes?.data) {
        setDrugs(Array.isArray(drugsRes.data) ? drugsRes.data : [])
      } else if (Array.isArray(drugsRes)) {
        setDrugs(drugsRes)
      }
      if (sitesRes?.data) {
        setSites(Array.isArray(sitesRes.data) ? sitesRes.data : [])
      } else if (Array.isArray(sitesRes)) {
        setSites(sitesRes)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      drugId: parseInt(formData.drugId),
      drugName: formData.drugName,
      drugCode: formData.drugCode,
      siteId: parseInt(formData.siteId),
      siteName: formData.siteName,
      plannedQuantity: parseFloat(formData.plannedQuantity),
      unit: formData.unit,
      bomVersion: parseInt(formData.bomVersion),
      status: formData.status as WorkOrderStatus,
      priority: formData.priority as ManufacturingPriority,
      plannedStartDate: formData.plannedStartDate,
      plannedEndDate: formData.plannedEndDate,
      assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
      remarks: formData.remarks || undefined,
    }

    await onSubmit(submitData)
  }

  const handleDrugChange = (drugId: string) => {
    const drug = drugs.find(d => d.id.toString() === drugId)
    if (drug) {
      setFormData(prev => ({
        ...prev,
        drugId: drug.id.toString(),
        drugName: drug.name,
        drugCode: drug.code,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        drugId: "",
        drugName: "",
        drugCode: "",
      }))
    }
  }

  const handleSiteChange = (siteId: string) => {
    const site = sites.find(s => s.id.toString() === siteId)
    if (site) {
      setFormData(prev => ({
        ...prev,
        siteId: site.id.toString(),
        siteName: site.name,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        siteId: "",
        siteName: "",
      }))
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FormSelect
            name="drugId"
            label="Drug"
            value={formData.drugId || undefined}
            onChange={handleDrugChange}
            options={drugs.map((drug) => ({
              value: drug.id.toString(),
              label: `${drug.name} (${drug.code})`,
            }))}
            placeholder="Select Drug"
            required
          />
        </div>

        <div className="space-y-2">
          <FormSelect
            name="siteId"
            label="Site"
            value={formData.siteId || undefined}
            onChange={handleSiteChange}
            options={sites.map((site) => ({
              value: site.id.toString(),
              label: site.name,
            }))}
            placeholder="Select Site"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
          <FormInput
            id="plannedQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.plannedQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, plannedQuantity: e.target.value }))}
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

        <div className="space-y-2">
          <Label htmlFor="bomVersion">BOM Version *</Label>
          <FormInput
            id="bomVersion"
            type="number"
            min="1"
            value={formData.bomVersion}
            onChange={(e) => setFormData(prev => ({ ...prev, bomVersion: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <FormSelect
            name="status"
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            options={[
              { value: "Draft", label: "Draft" },
              { value: "Planned", label: "Planned" },
              { value: "In Progress", label: "In Progress" },
              { value: "On Hold", label: "On Hold" },
              { value: "Completed", label: "Completed" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            placeholder="Select Status"
          />
        </div>

        <div className="space-y-2">
          <FormSelect
            name="priority"
            label="Priority"
            value={formData.priority}
            onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            options={[
              { value: "Low", label: "Low" },
              { value: "Normal", label: "Normal" },
              { value: "High", label: "High" },
              { value: "Urgent", label: "Urgent" },
            ]}
            placeholder="Select Priority"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedStartDate">Planned Start Date *</Label>
          <FormInput
            id="plannedStartDate"
            type="date"
            value={formData.plannedStartDate}
            onChange={(e) => setFormData(prev => ({ ...prev, plannedStartDate: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedEndDate">Planned End Date *</Label>
          <FormInput
            id="plannedEndDate"
            type="date"
            value={formData.plannedEndDate}
            onChange={(e) => setFormData(prev => ({ ...prev, plannedEndDate: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      <FormActions>
        <Button type="submit" disabled={loading}>
          {submitLabel}
        </Button>
      </FormActions>
    </Form>
  )
}


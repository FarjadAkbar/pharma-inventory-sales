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
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="drugId">Drug *</Label>
          <FormSelect
            id="drugId"
            value={formData.drugId}
            onValueChange={handleDrugChange}
            required
          >
            <option value="">Select Drug</option>
            {drugs.map((drug) => (
              <option key={drug.id} value={drug.id.toString()}>
                {drug.name} ({drug.code})
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteId">Site *</Label>
          <FormSelect
            id="siteId"
            value={formData.siteId}
            onValueChange={handleSiteChange}
            required
          >
            <option value="">Select Site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id.toString()}>
                {site.name}
              </option>
            ))}
          </FormSelect>
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
          <Label htmlFor="status">Status</Label>
          <FormSelect
            id="status"
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <option value="Draft">Draft</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </FormSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <FormSelect
            id="priority"
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </FormSelect>
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


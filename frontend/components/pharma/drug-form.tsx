"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, pharmaValidationRules } from "@/lib/form-validation"

interface Drug {
  id?: string
  code: string
  name: string
  formula: string
  strength: string
  dosageForm: string
  route: string
  description: string
  therapeuticClass: string
  manufacturer: string
  approvalStatus: "Draft" | "Pending" | "Approved" | "Rejected"
  isActive: boolean
}

interface DrugFormProps {
  initialData?: Partial<Drug>
  onSubmit: (data: Drug) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

/** Values must match master-data `DosageForm` enum in @repo/shared */
const DOSAGE_OPTIONS = [
  { value: "Tablet", label: "Tablet" },
  { value: "Capsule", label: "Capsule" },
  { value: "Syrup", label: "Syrup" },
  { value: "Injection", label: "Injection" },
  { value: "Cream", label: "Cream" },
  { value: "Ointment", label: "Ointment" },
  { value: "Drops", label: "Drops" },
  { value: "Inhaler", label: "Inhaler" },
  { value: "Patch", label: "Patch" },
  { value: "Powder", label: "Powder" },
  { value: "Suspension", label: "Suspension" },
]

/** Values must match master-data `Route` enum (labels are UI-only) */
const ROUTE_OPTIONS = [
  { value: "Oral", label: "Oral" },
  { value: "IV", label: "Intravenous (IV)" },
  { value: "IM", label: "Intramuscular (IM)" },
  { value: "SC", label: "Subcutaneous (SC)" },
  { value: "Topical", label: "Topical" },
  { value: "Inhalation", label: "Inhalation" },
  { value: "Rectal", label: "Rectal" },
  { value: "Vaginal", label: "Vaginal" },
  { value: "Ophthalmic", label: "Ophthalmic" },
  { value: "Otic", label: "Otic" },
  { value: "Nasal", label: "Nasal" },
]

const THERAPEUTIC_CLASSES = [
  "Antibiotics", "Analgesics", "Antipyretics", "Antihistamines", 
  "Antacids", "Antidiabetics", "Antihypertensives", "Anticoagulants",
  "Bronchodilators", "Corticosteroids", "Diuretics", "Vitamins"
]

const MANUFACTURERS = [
  "Pfizer", "Johnson & Johnson", "Novartis", "Roche", "Merck",
  "GlaxoSmithKline", "Sanofi", "AstraZeneca", "Bayer", "Abbott"
]

export function DrugForm({ initialData, onSubmit, submitLabel = "Save", onCancel }: DrugFormProps) {
  const initialFormData: Drug = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    formula: initialData?.formula || "",
    strength: initialData?.strength || "",
    dosageForm: initialData?.dosageForm || "",
    route: initialData?.route || "",
    description: initialData?.description || "",
    therapeuticClass: initialData?.therapeuticClass || "",
    manufacturer: initialData?.manufacturer || "",
    approvalStatus: initialData?.approvalStatus || "Draft",
    isActive: initialData?.isActive ?? true,
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...pharmaValidationRules,
    dosageForm: {
      required: true,
      message: "Please select a dosage form"
    },
    route: {
      required: true,
      message: "Please select a route of administration"
    },
    therapeuticClass: {
      required: true,
      message: "Please select a therapeutic class"
    },
    manufacturer: {
      required: true,
      message: "Please select a manufacturer"
    },
    approvalStatus: {
      required: true,
      message: "Please select an approval status"
    }
  })

  const handleSubmit = async () => {
    const data = formState.data
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(data as Record<string, unknown>)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      const drugData: Drug = {
        code: data.code,
        name: data.name,
        formula: data.formula,
        strength: data.strength,
        dosageForm: data.dosageForm,
        route: data.route,
        description: data.description,
        therapeuticClass: data.therapeuticClass,
        manufacturer: data.manufacturer,
        approvalStatus: data.approvalStatus,
        isActive: data.isActive,
      }

      await onSubmit(drugData)
      formState.setSuccess("Drug saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save drug")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form 
          onSubmit={handleSubmit} 
          loading={formState.isLoading}
          error={formState.error}
          success={formState.success}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="code"
              label="Drug Code"
              value={formState.data.code}
              onChange={(e) => formState.updateField('code', e.target.value.toUpperCase())}
              error={formState.errors.code}
              required
              placeholder="e.g., DRUG-001"
            />
            <FormInput
              name="name"
              label="Drug Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="formula"
              label="Chemical Formula"
              value={formState.data.formula}
              onChange={(e) => formState.updateField('formula', e.target.value)}
              error={formState.errors.formula}
              required
              placeholder="e.g., C8H9NO2"
            />
            <FormInput
              name="strength"
              label="Strength"
              value={formState.data.strength}
              onChange={(e) => formState.updateField('strength', e.target.value)}
              error={formState.errors.strength}
              required
              placeholder="e.g., 500mg, 10ml"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="dosageForm"
              label="Dosage Form"
              value={formState.data.dosageForm}
              onChange={(value) => formState.updateField('dosageForm', value)}
              error={formState.errors.dosageForm}
              required
              options={DOSAGE_OPTIONS}
              placeholder="Select dosage form"
            />
            <FormSelect
              name="route"
              label="Route of Administration"
              value={formState.data.route}
              onChange={(value) => formState.updateField('route', value)}
              error={formState.errors.route}
              required
              options={ROUTE_OPTIONS}
              placeholder="Select route"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="therapeuticClass"
              label="Therapeutic Class"
              value={formState.data.therapeuticClass}
              onChange={(value) => formState.updateField('therapeuticClass', value)}
              error={formState.errors.therapeuticClass}
              required
              options={THERAPEUTIC_CLASSES.map(cls => ({ value: cls, label: cls }))}
              placeholder="Select therapeutic class"
            />
            <FormSelect
              name="manufacturer"
              label="Manufacturer"
              value={formState.data.manufacturer}
              onChange={(value) => formState.updateField('manufacturer', value)}
              error={formState.errors.manufacturer}
              required
              options={MANUFACTURERS.map(man => ({ value: man, label: man }))}
              placeholder="Select manufacturer"
            />
          </div>

          <FormTextarea
            name="description"
            label="Description"
            value={formState.data.description}
            onChange={(e) => formState.updateField('description', e.target.value)}
            error={formState.errors.description}
            rows={3}
            placeholder="Detailed description of the drug"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="approvalStatus"
              label="Approval Status"
              value={formState.data.approvalStatus}
              onChange={(value) => formState.updateField('approvalStatus', value as Drug['approvalStatus'])}
              error={formState.errors.approvalStatus}
              required
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Pending", label: "Pending Approval" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" }
              ]}
            />
            <FormSelect
              name="isActive"
              label="Status"
              value={formState.data.isActive.toString()}
              onChange={(value) => formState.updateField('isActive', value === "true")}
              error={formState.errors.isActive}
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" }
              ]}
            />
          </div>

          <FormActions 
            loading={formState.isLoading}
            submitLabel={submitLabel}
            onCancel={onCancel}
          />
        </Form>
      </CardContent>
    </Card>
  )
}

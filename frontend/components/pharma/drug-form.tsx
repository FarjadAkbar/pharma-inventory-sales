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

const DOSAGE_FORMS = [
  "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", 
  "Drops", "Inhaler", "Patch", "Suppository", "Powder", "Solution"
]

const ROUTES = [
  "Oral", "Intravenous", "Intramuscular", "Subcutaneous", "Topical", 
  "Inhalation", "Rectal", "Vaginal", "Ophthalmic", "Otic", "Nasal"
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

  const handleSubmit = async (data: any) => {
    formState.setLoading(true)
    formState.clearErrors()
    
    try {
      // Validate form
      const errors = validation.validateForm(data)
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
        isActive: data.isActive === "true" || data.isActive === true,
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
              onChange={(e) => formState.updateField('dosageForm', e.target.value)}
              error={formState.errors.dosageForm}
              required
              options={DOSAGE_FORMS.map(form => ({ value: form, label: form }))}
              placeholder="Select dosage form"
            />
            <FormSelect
              name="route"
              label="Route of Administration"
              value={formState.data.route}
              onChange={(e) => formState.updateField('route', e.target.value)}
              error={formState.errors.route}
              required
              options={ROUTES.map(route => ({ value: route, label: route }))}
              placeholder="Select route"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="therapeuticClass"
              label="Therapeutic Class"
              value={formState.data.therapeuticClass}
              onChange={(e) => formState.updateField('therapeuticClass', e.target.value)}
              error={formState.errors.therapeuticClass}
              required
              options={THERAPEUTIC_CLASSES.map(cls => ({ value: cls, label: cls }))}
              placeholder="Select therapeutic class"
            />
            <FormSelect
              name="manufacturer"
              label="Manufacturer"
              value={formState.data.manufacturer}
              onChange={(e) => formState.updateField('manufacturer', e.target.value)}
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
              onChange={(e) => formState.updateField('approvalStatus', e.target.value)}
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
              onChange={(e) => formState.updateField('isActive', e.target.value === "true")}
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

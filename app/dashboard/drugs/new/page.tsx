"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { Drug, DosageForm, Route, ApprovalStatus, StorageCondition } from "@/types/pharma"

export default function NewDrugPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<Partial<Drug>>({
    code: "",
    name: "",
    formula: "",
    strength: "",
    dosageForm: "Tablet",
    route: "Oral",
    description: "",
    approvalStatus: "Draft",
    therapeuticClass: "",
    manufacturer: "",
    registrationNumber: "",
    expiryDate: "",
    storageConditions: []
  })

  const [newStorageCondition, setNewStorageCondition] = useState<StorageCondition>({
    type: "temperature",
    minValue: undefined,
    maxValue: undefined,
    unit: "°C",
    description: ""
  })

  const dosageForms: DosageForm[] = [
    "Tablet", "Capsule", "Syrup", "Injection", "Ointment", 
    "Cream", "Drops", "Powder", "Suspension", "Patch", "Inhaler"
  ]

  const routes: Route[] = [
    "Oral", "IV", "IM", "SC", "Topical", "Inhalation", 
    "Rectal", "Vaginal", "Ophthalmic", "Otic", "Nasal"
  ]

  const approvalStatuses: ApprovalStatus[] = [
    "Draft", "Pending", "Approved", "Rejected", "Under Review"
  ]

  const storageTypes = [
    { value: "temperature", label: "Temperature" },
    { value: "humidity", label: "Humidity" },
    { value: "light", label: "Light" },
    { value: "special", label: "Special" }
  ]

  const units = {
    temperature: ["°C", "°F"],
    humidity: ["%"],
    light: ["lux", "foot-candles"],
    special: ["custom"]
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code) newErrors.code = "Drug code is required"
    if (!formData.name) newErrors.name = "Drug name is required"
    if (!formData.formula) newErrors.formula = "Chemical formula is required"
    if (!formData.strength) newErrors.strength = "Strength is required"
    if (!formData.dosageForm) newErrors.dosageForm = "Dosage form is required"
    if (!formData.route) newErrors.route = "Route of administration is required"
    if (!formData.description) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await apiService.createDrug(formData as Drug)
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/drugs")
      }, 2000)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create drug" })
    } finally {
      setLoading(false)
    }
  }

  const addStorageCondition = () => {
    if (newStorageCondition.description) {
      setFormData(prev => ({
        ...prev,
        storageConditions: [...(prev.storageConditions || []), { ...newStorageCondition }]
      }))
      setNewStorageCondition({
        type: "temperature",
        minValue: undefined,
        maxValue: undefined,
        unit: "°C",
        description: ""
      })
    }
  }

  const removeStorageCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      storageConditions: prev.storageConditions?.filter((_, i) => i !== index) || []
    }))
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Drug Created Successfully!</h2>
                <p className="text-muted-foreground mb-4">
                  The drug has been added to the system and is ready for review.
                </p>
                <Button onClick={() => router.push("/dashboard/drugs")} className="bg-orange-600 hover:bg-orange-700">
                  View All Drugs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Drug</h1>
            <p className="text-muted-foreground">Create a new pharmaceutical drug entry</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential drug identification and classification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Drug Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., DRG-001"
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Drug Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Paracetamol"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formula">Chemical Formula *</Label>
                  <Input
                    id="formula"
                    value={formData.formula}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                    placeholder="e.g., C8H9NO2"
                    className={errors.formula ? "border-red-500" : ""}
                  />
                  {errors.formula && <p className="text-sm text-red-500">{errors.formula}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">Strength *</Label>
                  <Input
                    id="strength"
                    value={formData.strength}
                    onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                    placeholder="e.g., 500mg"
                    className={errors.strength ? "border-red-500" : ""}
                  />
                  {errors.strength && <p className="text-sm text-red-500">{errors.strength}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageForm">Dosage Form *</Label>
                  <Select 
                    value={formData.dosageForm} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dosageForm: value as DosageForm }))}
                  >
                    <SelectTrigger className={errors.dosageForm ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map((form) => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dosageForm && <p className="text-sm text-red-500">{errors.dosageForm}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="route">Route of Administration *</Label>
                  <Select 
                    value={formData.route} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, route: value as Route }))}
                  >
                    <SelectTrigger className={errors.route ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route} value={route}>{route}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.route && <p className="text-sm text-red-500">{errors.route}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the drug..."
                  className={errors.description ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Regulatory and manufacturing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="therapeuticClass">Therapeutic Class</Label>
                  <Input
                    id="therapeuticClass"
                    value={formData.therapeuticClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, therapeuticClass: e.target.value }))}
                    placeholder="e.g., Analgesics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="e.g., Ziauddin Pharmaceuticals"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="e.g., DRAP-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalStatus">Approval Status</Label>
                  <Select 
                    value={formData.approvalStatus} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, approvalStatus: value as ApprovalStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvalStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            {getApprovalStatusBadge(status)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Conditions</CardTitle>
              <CardDescription>Specify storage requirements for the drug</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.storageConditions?.map((condition, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <div className="text-sm font-medium">{condition.type}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Range</Label>
                      <div className="text-sm">
                        {condition.minValue && condition.maxValue 
                          ? `${condition.minValue} - ${condition.maxValue} ${condition.unit}`
                          : condition.minValue 
                            ? `Min: ${condition.minValue} ${condition.unit}`
                            : condition.maxValue 
                              ? `Max: ${condition.maxValue} ${condition.unit}`
                              : condition.description
                        }
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <div className="text-sm">{condition.description}</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStorageCondition(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Type</Label>
                    <Select 
                      value={newStorageCondition.type} 
                      onValueChange={(value) => setNewStorageCondition(prev => ({ 
                        ...prev, 
                        type: value as any,
                        unit: units[value as keyof typeof units][0]
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {storageTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Min Value</Label>
                    <Input
                      type="number"
                      value={newStorageCondition.minValue || ""}
                      onChange={(e) => setNewStorageCondition(prev => ({ 
                        ...prev, 
                        minValue: e.target.value ? Number(e.target.value) : undefined 
                      }))}
                      placeholder="Min"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Max Value</Label>
                    <Input
                      type="number"
                      value={newStorageCondition.maxValue || ""}
                      onChange={(e) => setNewStorageCondition(prev => ({ 
                        ...prev, 
                        maxValue: e.target.value ? Number(e.target.value) : undefined 
                      }))}
                      placeholder="Max"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Unit</Label>
                    <Select 
                      value={newStorageCondition.unit} 
                      onValueChange={(value) => setNewStorageCondition(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units[newStorageCondition.type as keyof typeof units].map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  <Label className="text-xs">Description</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newStorageCondition.description}
                      onChange={(e) => setNewStorageCondition(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Storage condition description"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addStorageCondition} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Drug
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

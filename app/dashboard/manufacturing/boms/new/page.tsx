"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Package,
  Beaker,
  Activity,
  Target,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { BOM, BOMItem } from "@/types/manufacturing"
import { formatDateISO } from "@/lib/utils"

export default function NewBOMPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    drugId: "",
    drugName: "",
    drugCode: "",
    description: "",
    status: "Draft" as const,
    remarks: ""
  })

  const [bomItems, setBOMItems] = useState<BOMItem[]>([])
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([])

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await apiService.getRawMaterials()
      if (response.success && response.data) {
        setAvailableMaterials(response.data.rawMaterials || [])
      }
    } catch (error) {
      console.error("Failed to fetch materials:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addBOMItem = () => {
    const newItem: BOMItem = {
      id: Date.now().toString(),
      materialId: "",
      materialName: "",
      materialCode: "",
      quantityPerBatch: 0,
      unit: "",
      tolerance: 0,
      isCritical: false,
      sequence: bomItems.length + 1,
      remarks: ""
    }
    setBOMItems(prev => [...prev, newItem])
  }

  const updateBOMItem = (index: number, field: string, value: string | number | boolean) => {
    setBOMItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const removeBOMItem = (index: number) => {
    setBOMItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      sequence: i + 1
    })))
  }

  const handleMaterialSelect = (index: number, materialId: string) => {
    const material = availableMaterials.find(m => m.id === materialId)
    if (material) {
      updateBOMItem(index, "materialId", material.id)
      updateBOMItem(index, "materialName", material.name)
      updateBOMItem(index, "materialCode", material.code)
      updateBOMItem(index, "unit", material.unit)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.drugId || !formData.drugName || !formData.drugCode) {
      setErrors({ drug: "Please select a drug" })
      return
    }

    if (bomItems.length === 0) {
      setErrors({ items: "At least one BOM item is required" })
      return
    }

    const invalidItems = bomItems.filter(item => 
      !item.materialId || !item.quantityPerBatch || item.quantityPerBatch <= 0
    )

    if (invalidItems.length > 0) {
      setErrors({ items: "All BOM items must have valid material and quantity" })
      return
    }

    setSaving(true)
    try {
      const bomData = {
        ...formData,
        items: bomItems
      }

      await apiService.createBOM(bomData)

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/manufacturing/boms")
      }, 2000)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save BOM" })
    } finally {
      setSaving(false)
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Beaker className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Activity className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">BOM Created Successfully!</h2>
                <p className="text-muted-foreground mb-4">
                  The Bill of Materials has been created and saved.
                </p>
                <Button onClick={() => router.push("/dashboard/manufacturing/boms")} className="bg-orange-600 hover:bg-orange-700">
                  Back to BOMs
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
            <h1 className="text-3xl font-bold tracking-tight">Create Bill of Materials</h1>
            <p className="text-muted-foreground">Define the recipe and material requirements for manufacturing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BOM Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                BOM Information
              </CardTitle>
              <CardDescription>Basic information about the Bill of Materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Drug *</Label>
                  <Select value={formData.drugId} onValueChange={(value) => {
                    const drug = availableMaterials.find(m => m.id === value)
                    if (drug) {
                      handleInputChange("drugId", drug.id)
                      handleInputChange("drugName", drug.name)
                      handleInputChange("drugCode", drug.code)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Paracetamol Tablets (DRG-001)</SelectItem>
                      <SelectItem value="2">Ibuprofen Tablets (DRG-002)</SelectItem>
                      <SelectItem value="3">Aspirin Tablets (DRG-003)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.drug && (
                    <p className="text-sm text-red-600">{errors.drug}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Version</Label>
                  <Input value="1" disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  placeholder="Enter BOM description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Remarks</Label>
                <Textarea
                  placeholder="Enter any remarks..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* BOM Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                BOM Items
              </CardTitle>
              <CardDescription>Define the materials and quantities required for manufacturing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bomItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Item {item.sequence}</Badge>
                      {item.isCritical && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Critical
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBOMItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Material *</Label>
                      <Select value={item.materialId} onValueChange={(value) => handleMaterialSelect(index, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMaterials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name} ({material.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Quantity per Batch *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.quantityPerBatch || ""}
                        onChange={(e) => updateBOMItem(index, "quantityPerBatch", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Unit</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) => updateBOMItem(index, "unit", e.target.value)}
                        placeholder="kg, g, ml, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tolerance (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={item.tolerance || ""}
                        onChange={(e) => updateBOMItem(index, "tolerance", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`critical-${index}`}
                        checked={item.isCritical}
                        onChange={(e) => updateBOMItem(index, "isCritical", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`critical-${index}`} className="text-sm">
                        Critical Material
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Remarks</Label>
                    <Input
                      placeholder="Enter remarks for this item..."
                      value={item.remarks || ""}
                      onChange={(e) => updateBOMItem(index, "remarks", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addBOMItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add BOM Item
              </Button>

              {errors.items && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.items}</AlertDescription>
                </Alert>
              )}
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
            <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save BOM
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

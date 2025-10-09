"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { rawMaterialsApi, suppliersApi, sitesApi } from "@/services"
import type { RawMaterial, CreateRawMaterialData, UpdateRawMaterialData } from "@/types/raw-materials"

interface Supplier {
  id: number
  name: string
}

interface Site {
  id: number
  name: string
}

interface RawMaterialFormProps {
  rawMaterialId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function RawMaterialForm({ rawMaterialId, onSuccess, onCancel }: RawMaterialFormProps) {
  const [formData, setFormData] = useState<CreateRawMaterialData>({
    code: "",
    name: "",
    description: "",
    grade: "",
    storage_req: "",
    unit_id: 0,
    supplier_id: 0,
    status: "Active"
  })
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [units, setUnits] = useState<{ id: number; name: string; type: string }[]>([])

  const isEdit = !!rawMaterialId

  useEffect(() => {
    fetchSuppliers()
    fetchSites()
    fetchUnits()
    if (isEdit && rawMaterialId) {
      fetchRawMaterial()
    }
  }, [rawMaterialId])

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersApi.getSuppliers()
      if (response.status && response.data) {
        const suppliersData = Array.isArray(response.data) ? response.data : [response.data]
        setSuppliers(suppliersData.map((supplier: any) => ({ id: supplier.id, name: supplier.name })))
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    }
  }

  const fetchSites = async () => {
    try {
      const response = await sitesApi.getSites()
      if (response.status && response.data) {
        setSites(response.data.map((site: any) => ({ id: site.id, name: site.name })))
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    }
  }

  const fetchUnits = async () => {
    // For now, we'll use a predefined list of units
    // In a real implementation, this would come from an API
    setUnits([
      { id: 1, name: "mg", type: "Weight" },
      { id: 2, name: "g", type: "Weight" },
      { id: 3, name: "kg", type: "Weight" },
      { id: 4, name: "ml", type: "Volume" },
      { id: 5, name: "L", type: "Volume" },
      { id: 6, name: "pieces", type: "Count" },
      { id: 7, name: "units", type: "Count" }
    ])
  }

  const fetchRawMaterial = async () => {
    if (!rawMaterialId) return
    
    try {
      const response = await rawMaterialsApi.getRawMaterial(rawMaterialId)
      if (response.status && response.data) {
        const rawMaterial = Array.isArray(response.data) ? response.data[0] : response.data
        setFormData({
          code: rawMaterial.code,
          name: rawMaterial.raw_material_name,
          description: rawMaterial.description,
          grade: rawMaterial.grade || "",
          storage_req: rawMaterial.storage_req || "",
          unit_id: rawMaterial.unit_id,
          supplier_id: rawMaterial.supplier_id,
          status: rawMaterial.status
        })
      }
    } catch (error) {
      console.error("Failed to fetch raw material:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields")
      return
    }

    if (formData.unit_id === 0 || formData.supplier_id === 0) {
      alert("Please select a unit and supplier")
      return
    }

    setLoading(true)
    try {
      if (isEdit && rawMaterialId) {
        await rawMaterialsApi.updateRawMaterial(rawMaterialId, formData)
      } else {
        await rawMaterialsApi.createRawMaterial(formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save raw material:", error)
      alert("Failed to save raw material. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Raw Material" : "Add New Raw Material"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update the raw material information" : "Enter the details for the new raw material"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., RM#001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Raw material name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the raw material"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., USP, BP, EP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage_req">Storage Requirements</Label>
              <Input
                id="storage_req"
                value={formData.storage_req}
                onChange={(e) => setFormData({ ...formData, storage_req: e.target.value })}
                placeholder="e.g., Room temperature, Refrigerated"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unit *</Label>
              <Select
                value={formData.unit_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, unit_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name} ({unit.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select
                value={formData.supplier_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === "Active"}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Active" : "InActive" })}
            />
            <Label htmlFor="status">
              {formData.status === "Active" ? "Active" : "Inactive"}
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

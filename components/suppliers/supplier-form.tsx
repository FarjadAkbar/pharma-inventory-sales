"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sitesApi } from "@/services"
import { suppliersApi } from "@/services"
import type { Supplier, CreateSupplierData, UpdateSupplierData } from "@/types/suppliers"

interface SupplierFormProps {
  supplierId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function SupplierForm({ supplierId, onSuccess, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState<CreateSupplierData>({
    site_id: 1, // Default site ID, should be dynamic based on user's site
    code: "",
    name: "",
    contact: "",
    address: "",
    approved: true,
    rating: 0
  })
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(!!supplierId)
  const [sites, setSites] = useState<Array<{id: number, name: string}>>([])

  useEffect(() => {
    fetchSites()
    if (supplierId) {
      fetchSupplier()
    }
  }, [supplierId])

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

  const fetchSupplier = async () => {
    if (!supplierId) return
    
    try {
      const response = await suppliersApi.getSupplier(supplierId)
      if (response.status && response.data) {
        const supplier = Array.isArray(response.data) ? response.data[0] : response.data
        setFormData({
          site_id: supplier.site_id,
          code: supplier.code,
          name: supplier.name,
          contact: supplier.contact,
          address: supplier.address,
          approved: supplier.approved === 1,
          rating: parseFloat(supplier.rating)
        })
      }
    } catch (error) {
      console.error("Failed to fetch supplier:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name.trim() || !formData.contact.trim() || !formData.address.trim()) {
      alert("Please fill in all required fields")
      return
    }

    if (formData.rating < 0 || formData.rating > 5) {
      alert("Rating must be between 0 and 5")
      return
    }

    setLoading(true)
    try {
      if (isEdit && supplierId) {
        await suppliersApi.updateSupplier(supplierId, formData)
      } else {
        await suppliersApi.createSupplier(formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save supplier:", error)
      alert("Failed to save supplier. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Supplier" : "Add New Supplier"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update supplier information" : "Enter supplier details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_id">Site *</Label>
              <Select
                className="w-full"
                value={formData.site_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, site_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Supplier Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., S#001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="e.g., +92 3001234567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter supplier address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approved">Approved</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="approved"
                  checked={formData.approved}
                  onCheckedChange={(checked) => setFormData({ ...formData, approved: checked })}
                />
                <Label htmlFor="approved">{formData.approved ? "Yes" : "No"}</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (isEdit ? "Update Supplier" : "Create Supplier")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

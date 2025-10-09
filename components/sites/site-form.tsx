"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sitesApi } from "@/services"
import type { Site, CreateSiteData } from "@/types/sites"

interface SiteFormProps {
  siteId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function SiteForm({ siteId, onSuccess, onCancel }: SiteFormProps) {
  const [formData, setFormData] = useState<CreateSiteData>({
    name: "",
    location: ""
  })
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(!!siteId)

  useEffect(() => {
    if (siteId) {
      fetchSite()
    }
  }, [siteId])

  const fetchSite = async () => {
    if (!siteId) return
    
    try {
      const response = await sitesApi.getSite(siteId)
      if (response.status && response.data) {
        setFormData({
          name: response.data.name,
          location: response.data.location
        })
      }
    } catch (error) {
      console.error("Failed to fetch site:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.location.trim()) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
        if (isEdit && siteId) {
          await sitesApi.updateSite(siteId, formData)
        } else {
          await sitesApi.createSite(formData)
        }
      onSuccess()
    } catch (error) {
      console.error("Failed to save site:", error)
      alert("Failed to save site. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Site" : "Add New Site"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update site information" : "Enter site details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter site name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter site location"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (isEdit ? "Update Site" : "Create Site")}
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

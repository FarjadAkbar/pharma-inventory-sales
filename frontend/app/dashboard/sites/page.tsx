"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { sitesApi, type Site } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"
import { SiteForm } from "@/components/sites/site-form"

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)

  useEffect(() => {
    fetchSites()
  }, [searchQuery, pagination.page])

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await sitesApi.getSites({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })
      
      setSites(response)
      setPagination({ page: pagination.page, pages: 1, total: response.length })
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEdit = (site: Site) => {
    setEditingSite(site)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingSite(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSite(null)
  }

  const handleSubmit = async (data: {
    name: string
    address?: string
    city?: string
    country?: string
    type?: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse' | 'manufacturing'
    isActive?: boolean
  }) => {
    try {
      if (editingSite) {
        await sitesApi.updateSite(editingSite.id.toString(), data)
      } else {
        await sitesApi.createSite(data)
      }
      handleCloseModal()
      fetchSites()
      sitesApi.invalidateSites()
    } catch (error) {
      console.error("Failed to save site:", error)
      throw error
    }
  }

  const handleDelete = (site: Site) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!siteToDelete) return
    
    try {
      await sitesApi.deleteSite(siteToDelete.id.toString())
      fetchSites()
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
      sitesApi.invalidateSites()
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setSiteToDelete(null)
  }

  // Color mapping for site types (frontend only)
  const SITE_TYPE_COLORS: Record<string, string> = {
    hospital: 'bg-blue-100 text-blue-800',
    clinic: 'bg-green-100 text-green-800',
    pharmacy: 'bg-purple-100 text-purple-800',
    warehouse: 'bg-orange-100 text-orange-800',
    manufacturing: 'bg-red-100 text-red-800',
  }

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const getSiteTypeBadgeColor = (type?: string): string => {
    return type ? (SITE_TYPE_COLORS[type] || "bg-gray-100 text-gray-800") : "bg-gray-100 text-gray-800"
  }

  const columns = [
    {
      key: "name",
      header: "Site Name",
      render: (site: Site) => (
        <div className="font-medium">{site.name}</div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (site: Site) => (
        site.type ? (
          <Badge className={getSiteTypeBadgeColor(site.type)}>
            {capitalizeFirst(site.type)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (site: Site) => (
        <div className="text-sm text-muted-foreground">
          {[site.address, site.city, site.country].filter(Boolean).join(", ") || "-"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (site: Site) => (
        <Badge variant={site.isActive ? "default" : "secondary"}>
          {site.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (site: Site) => formatDateISO(site.createdAt),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      render: (site: Site) => formatDateISO(site.updatedAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
            <p className="text-muted-foreground">Manage company sites and facilities</p>
          </div>

          <PermissionGuard module="MASTER_DATA" action="create">
            <Button onClick={handleAdd}>
              <Plus />
              Add Site
            </Button>
          </PermissionGuard>
        </div>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sites</CardTitle>
            <CardDescription>A list of all sites in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={sites}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search sites..."
              actions={[
                {
                  label: "Edit",
                  onClick: (site: Site) => handleEdit(site),
                  variant: "outline" as const,
                },
                {
                  label: "Delete",
                  onClick: (site: Site) => handleDelete(site),
                  variant: "destructive" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Site Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSite ? "Edit Site" : "Add New Site"}</DialogTitle>
              <DialogDescription>
                {editingSite ? "Update site information" : "Create a new site"}
              </DialogDescription>
            </DialogHeader>
            <SiteForm
              initialData={editingSite || undefined}
              onSubmit={handleSubmit}
              submitLabel={editingSite ? "Save Changes" : "Create Site"}
            />
          </DialogContent>
        </Dialog>
      </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Site</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the site "{siteToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </DashboardLayout>
  )
}
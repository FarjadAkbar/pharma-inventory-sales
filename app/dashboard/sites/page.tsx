"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Building2, Users, Settings } from "lucide-react"
import { sitesApi } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import type { Site } from "@/types/sites"

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  const hasFetchedRef = useRef(false)

  const fetchSites = async () => {
    console.log("fetchSites called at:", new Date().toISOString())
    try {
      setLoading(true)
      const response = await sitesApi.getSites()

      if (response.status && response.data) {
        setSites(response.data)
        setPagination({ page: 1, pages: 1, total: response.data.length })
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchSites()
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // For now, we'll do client-side filtering since the API doesn't support search
    // In the future, this could be updated to call the API with search parameters
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEdit = (site: Site) => {
    window.location.href = `/dashboard/sites/${site.id}`
  }

  const handleDelete = (site: Site) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!siteToDelete) return
    
    try {
      await sitesApi.deleteSite(siteToDelete.id)
      fetchSites() // Refresh the list
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setSiteToDelete(null)
  }

  const calculateStats = () => {
    const totalSites = sites.length
    return { totalSites }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Site Name",
      sortable: true,
      render: (site: Site) => (
        <div className="font-medium">{site.name}</div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (site: Site) => (
        <div className="text-sm text-muted-foreground">{site.location}</div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (site: Site) => (
        <div className="text-sm text-muted-foreground">
          {new Date(site.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "updated_at",
      header: "Last Updated",
      sortable: true,
      render: (site: Site) => (
        <div className="text-sm text-muted-foreground">
          {new Date(site.updated_at).toLocaleDateString()}
        </div>
      ),
    },
  ]

  const filterOptions: any[] = []

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    // For now, we'll do client-side filtering since the API doesn't support filters
    // In the future, this could be updated to call the API with filter parameters
  }

  const actions = (site: Site) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(site)}>
          Edit
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" action="delete">
        <Button variant="ghost" size="sm" onClick={() => handleDelete(site)}>
          Delete
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
            <p className="text-muted-foreground">Manage company sites and facilities</p>
          </div>

          <PermissionGuard module="MASTER_DATA" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/sites/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {sites.length > 0 ? new Date(sites[0]?.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sites Table */}
        <UnifiedDataTable
          data={sites}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search sites..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange
          }}
          actions={actions}
          onRefresh={fetchSites}
          onExport={() => console.log("Export sites")}
          emptyMessage="No sites found. Add your first site to get started."
        />
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
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
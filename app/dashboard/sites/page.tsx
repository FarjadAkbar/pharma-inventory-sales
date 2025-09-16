"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, MapPin, Phone, Mail, Users, Settings } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Site {
  id: string
  name: string
  code: string
  type: "manufacturing" | "warehouse" | "distribution" | "office" | "laboratory"
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  contactPerson: string
  email: string
  phone: string
  capacity: {
    employees: number
    storage: number
    production: number
  }
  facilities: string[]
  certifications: string[]
  isActive: boolean
  parentSiteId?: string
  parentSiteName?: string
  createdAt: string
  updatedAt: string
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchSites()
  }, [searchQuery, pagination.page, filters])

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSites({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const siteData = response.data as {
          sites: Site[]
          pagination: { page: number; pages: number; total: number }
        }
        setSites(siteData.sites || [])
        setPagination(siteData.pagination || { page: 1, pages: 1, total: 0 })
      }
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
    window.location.href = `/dashboard/sites/${site.id}`
  }

  const handleDelete = async (site: Site) => {
    if (confirm(`Are you sure you want to delete site "${site.name}"?`)) {
      try {
        await apiService.deleteSite(site.id)
        fetchSites()
      } catch (error) {
        console.error("Failed to delete site:", error)
      }
    }
  }

  const handleToggleStatus = async (site: Site) => {
    try {
      await apiService.updateSite(site.id, { isActive: !site.isActive })
      fetchSites()
    } catch (error) {
      console.error("Failed to toggle site status:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "manufacturing":
        return "bg-blue-100 text-blue-800"
      case "warehouse":
        return "bg-green-100 text-green-800"
      case "distribution":
        return "bg-purple-100 text-purple-800"
      case "office":
        return "bg-gray-100 text-gray-800"
      case "laboratory":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "manufacturing":
        return "🏭"
      case "warehouse":
        return "🏪"
      case "distribution":
        return "🚚"
      case "office":
        return "🏢"
      case "laboratory":
        return "🧪"
      default:
        return "🏢"
    }
  }

  const calculateStats = () => {
    const activeSites = sites.filter(s => s.isActive).length
    const manufacturingSites = sites.filter(s => s.type === "manufacturing").length
    const warehouseSites = sites.filter(s => s.type === "warehouse").length
    const totalEmployees = sites.reduce((sum, s) => sum + s.capacity.employees, 0)

    return { activeSites, manufacturingSites, warehouseSites, totalEmployees }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Site",
      sortable: true,
      render: (site: Site) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{getTypeIcon(site.type)}</span>
          </div>
          <div>
            <div className="font-medium">{site.name}</div>
            <div className="text-sm text-muted-foreground">{site.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (site: Site) => (
        <Badge className={getTypeBadgeColor(site.type)}>
          {site.type.charAt(0).toUpperCase() + site.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (site: Site) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{site.city}, {site.state}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortable: true,
      render: (site: Site) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{site.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{site.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      sortable: true,
      render: (site: Site) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{site.capacity.employees} employees</span>
          </div>
          <div>Storage: {site.capacity.storage} sq ft</div>
        </div>
      ),
    },
    {
      key: "facilities",
      header: "Facilities",
      sortable: true,
      render: (site: Site) => (
        <div className="flex flex-wrap gap-1">
          {site.facilities.slice(0, 2).map((facility) => (
            <Badge key={facility} variant="secondary" className="text-xs">
              {facility}
            </Badge>
          ))}
          {site.facilities.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{site.facilities.length - 2} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "parentSite",
      header: "Parent Site",
      sortable: true,
      render: (site: Site) => (
        <span className="text-sm text-muted-foreground">
          {site.parentSiteName || "Root Site"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (site: Site) => (
        <Badge variant={site.isActive ? "default" : "secondary"}>
          {site.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "type",
      label: "Site Type",
      type: "select" as const,
      options: [
        { value: "manufacturing", label: "Manufacturing" },
        { value: "warehouse", label: "Warehouse" },
        { value: "distribution", label: "Distribution" },
        { value: "office", label: "Office" },
        { value: "laboratory", label: "Laboratory" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ]

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const actions = (site: Site) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" screen="sites" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(site)}>
          Edit
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="sites" action="update">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleToggleStatus(site)}
        >
          {site.isActive ? "Deactivate" : "Activate"}
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="sites" action="delete">
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

          <PermissionGuard module="MASTER_DATA" screen="sites" action="create">
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
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manufacturing</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.manufacturingSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalEmployees}</div>
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
    </DashboardLayout>
  )
}

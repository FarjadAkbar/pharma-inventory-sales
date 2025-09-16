"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Barcode, Printer, Download, Eye, Package } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Label {
  id: string
  labelNumber: string
  type: "product" | "batch" | "location" | "shipping" | "custom"
  templateId: string
  templateName: string
  productId?: string
  productName?: string
  batchId?: string
  batchNumber?: string
  locationId?: string
  locationName?: string
  content: {
    title: string
    subtitle?: string
    barcode?: string
    qrCode?: string
    fields: Record<string, string>
  }
  status: "draft" | "printed" | "applied" | "damaged" | "voided"
  printedBy?: string
  printedByName?: string
  printedAt?: string
  appliedBy?: string
  appliedByName?: string
  appliedAt?: string
  printCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchLabels()
  }, [searchQuery, pagination.page, typeFilter, statusFilter])

  const fetchLabels = async () => {
    try {
      setLoading(true)
      const response = await apiService.getLabels({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const labelData = response.data as {
          labels: Label[]
          pagination: { page: number; pages: number; total: number }
        }
        setLabels(labelData.labels || [])
        setPagination(labelData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch labels:", error)
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

  const handleEdit = (label: Label) => {
    window.location.href = `/dashboard/warehouse/labels/${label.id}`
  }

  const handleDelete = async (label: Label) => {
    if (confirm(`Are you sure you want to delete label "${label.labelNumber}"?`)) {
      try {
        await apiService.deleteLabel(label.id)
        fetchLabels()
      } catch (error) {
        console.error("Failed to delete label:", error)
      }
    }
  }

  const handlePrint = async (label: Label) => {
    try {
      await apiService.printLabel(label.id)
      fetchLabels()
    } catch (error) {
      console.error("Failed to print label:", error)
    }
  }

  const handlePreview = async (label: Label) => {
    try {
      await apiService.previewLabel(label.id)
    } catch (error) {
      console.error("Failed to preview label:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "product":
        return "bg-blue-100 text-blue-800"
      case "batch":
        return "bg-green-100 text-green-800"
      case "location":
        return "bg-purple-100 text-purple-800"
      case "shipping":
        return "bg-orange-100 text-orange-800"
      case "custom":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "printed":
        return "bg-blue-100 text-blue-800"
      case "applied":
        return "bg-green-100 text-green-800"
      case "damaged":
        return "bg-red-100 text-red-800"
      case "voided":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateStats = () => {
    const totalLabels = labels.length
    const printedLabels = labels.filter(l => l.status === "printed").length
    const appliedLabels = labels.filter(l => l.status === "applied").length
    const draftLabels = labels.filter(l => l.status === "draft").length

    return { totalLabels, printedLabels, appliedLabels, draftLabels }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "label",
      header: "Label",
      render: (label: Label) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Barcode className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{label.labelNumber}</div>
            <div className="text-sm text-muted-foreground">{label.templateName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (label: Label) => (
        <Badge className={getTypeBadgeColor(label.type)}>
          {label.type.charAt(0).toUpperCase() + label.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "content",
      header: "Content",
      render: (label: Label) => (
        <div className="text-sm">
          <div className="font-medium">{label.content.title}</div>
          {label.content.subtitle && (
            <div className="text-muted-foreground">{label.content.subtitle}</div>
          )}
          {label.content.barcode && (
            <div className="text-xs text-muted-foreground">Barcode: {label.content.barcode}</div>
          )}
        </div>
      ),
    },
    {
      key: "associated",
      header: "Associated Item",
      render: (label: Label) => (
        <div className="text-sm">
          {label.productName && (
            <div>
              <div className="font-medium">{label.productName}</div>
              <div className="text-muted-foreground">Product</div>
            </div>
          )}
          {label.batchNumber && (
            <div>
              <div className="font-medium">{label.batchNumber}</div>
              <div className="text-muted-foreground">Batch</div>
            </div>
          )}
          {label.locationName && (
            <div>
              <div className="font-medium">{label.locationName}</div>
              <div className="text-muted-foreground">Location</div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "printInfo",
      header: "Print Info",
      render: (label: Label) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Printer className="h-3 w-3 text-muted-foreground" />
            <span>Count: {label.printCount}</span>
          </div>
          {label.printedByName && (
            <div>By: {label.printedByName}</div>
          )}
          {label.printedAt && (
            <div className="text-muted-foreground">{formatDateISO(label.printedAt)}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (label: Label) => (
        <Badge className={getStatusBadgeColor(label.status)}>
          {label.status.charAt(0).toUpperCase() + label.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (label: Label) => (
        <div className="text-sm">
          <div>{formatDateISO(label.createdAt)}</div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Labels & Barcodes</h1>
            <p className="text-muted-foreground">Manage product labels, barcodes, and printing</p>
          </div>

          <PermissionGuard module="WAREHOUSE" screen="labels" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/warehouse/labels/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Label
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Labels</CardTitle>
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Printed</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.printedLabels}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.appliedLabels}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Barcode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draftLabels}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter labels by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "product", label: "Product" },
                    { value: "batch", label: "Batch" },
                    { value: "location", label: "Location" },
                    { value: "shipping", label: "Shipping" },
                    { value: "custom", label: "Custom" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={typeFilter === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "draft", label: "Draft" },
                    { value: "printed", label: "Printed" },
                    { value: "applied", label: "Applied" },
                    { value: "damaged", label: "Damaged" },
                    { value: "voided", label: "Voided" },
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status.value)}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Labels Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Labels</CardTitle>
            <CardDescription>A list of all labels with their content and printing status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={labels}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search labels..."
              actions={(label: Label) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="WAREHOUSE" screen="labels" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(label)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="WAREHOUSE" screen="labels" action="print">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePrint(label)}
                      disabled={label.status === "voided"}
                    >
                      Print
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="WAREHOUSE" screen="labels" action="view">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePreview(label)}
                    >
                      Preview
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="WAREHOUSE" screen="labels" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(label)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

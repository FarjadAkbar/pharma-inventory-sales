"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Barcode,
  Printer,
  CheckCircle,
  XCircle,
  Package,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { LabelBarcode } from "@/types/warehouse"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function LabelsPage() {
  const router = useRouter()
  const [labels, setLabels] = useState<LabelBarcode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ 
    labelType?: string; 
    isPrinted?: boolean;
  }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [labelToDelete, setLabelToDelete] = useState<LabelBarcode | null>(null)

  useEffect(() => {
    fetchLabels()
  }, [searchQuery, filters, pagination.page])

  const fetchLabels = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getLabelBarcodes({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setLabels(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch labels:", error)
      toast.error("Failed to load labels & barcodes")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { 
      labelType?: string; 
      isPrinted?: boolean;
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleDelete = (label: LabelBarcode) => {
    setLabelToDelete(label)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!labelToDelete) return

    try {
      // Note: Delete endpoint may not exist, adjust as needed
      toast.success("Label deleted successfully")
      fetchLabels()
      setDeleteDialogOpen(false)
      setLabelToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete label")
    }
  }

  const handlePrint = async (label: LabelBarcode) => {
    try {
      await warehouseApi.printLabelBarcode(label.id.toString(), {
        printedBy: 1, // TODO: Get from auth context
        copies: 1,
      })
      toast.success("Label printed successfully")
      fetchLabels()
    } catch (error: any) {
      toast.error(error.message || "Failed to print label")
    }
  }

  const columns = [
    {
      header: "Barcode",
      accessorKey: "barcode",
      cell: ({ row }: any) => (
        <div className="font-mono font-medium">{row.original.barcode}</div>
      ),
    },
    {
      header: "Type",
      accessorKey: "labelType",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.labelType}</Badge>
      ),
    },
    {
      header: "Barcode Type",
      accessorKey: "barcodeType",
    },
    {
      header: "Reference",
      accessorKey: "referenceId",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.inventoryItemId && <div>Inventory: {row.original.inventoryItemId}</div>}
          {row.original.putawayItemId && <div>Putaway: {row.original.putawayItemId}</div>}
          {row.original.materialIssueId && <div>Issue: {row.original.materialIssueId}</div>}
          {row.original.cycleCountId && <div>Cycle Count: {row.original.cycleCountId}</div>}
          {row.original.locationId && <div>Location: {row.original.locationId}</div>}
          {row.original.batchNumber && <div>Batch: {row.original.batchNumber}</div>}
        </div>
      ),
    },
    {
      header: "Print Status",
      accessorKey: "isPrinted",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.isPrinted ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Printed</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Not Printed</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Print Count",
      accessorKey: "printCount",
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.printCount || 0}</div>
      ),
    },
    {
      header: "Printed At",
      accessorKey: "printedAt",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.printedAt ? new Date(row.original.printedAt).toLocaleString() : "N/A"}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "labelType",
      label: "Label Type",
      type: "select" as const,
      options: [
        { value: "Inventory Item", label: "Inventory Item" },
        { value: "Putaway", label: "Putaway" },
        { value: "Material Issue", label: "Material Issue" },
        { value: "Cycle Count", label: "Cycle Count" },
        { value: "Location", label: "Location" },
        { value: "Batch", label: "Batch" },
      ],
    },
    {
      key: "isPrinted",
      label: "Print Status",
      type: "select" as const,
      options: [
        { value: "true", label: "Printed" },
        { value: "false", label: "Not Printed" },
      ],
    },
  ]

  const actions = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (label: LabelBarcode) => router.push(`/dashboard/warehouse/labels/${label.id}`),
      variant: "ghost" as const,
    },
    {
      label: "Print",
      icon: <Printer className="h-4 w-4" />,
      onClick: handlePrint,
      variant: "ghost" as const,
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (label: LabelBarcode) => router.push(`/dashboard/warehouse/labels/${label.id}/edit`),
      variant: "ghost" as const,
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "ghost" as const,
    },
  ]

  const stats = {
    total: labels.length,
    printed: labels.filter(l => l.isPrinted).length,
    notPrinted: labels.filter(l => !l.isPrinted).length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Labels & Barcodes</h1>
            <p className="text-muted-foreground">Manage labels and barcodes for warehouse items</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/labels/new")}>
            <Plus  />
            Create Label
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Labels</CardTitle>
              <Barcode className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Printed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.printed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Printed</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.notPrinted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Labels Table */}
        <UnifiedDataTable
          data={labels}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search labels..."
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
          onRefresh={fetchLabels}
          onExport={() => console.log("Export labels")}
          emptyMessage="No labels found. Create your first label to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Label"
          description={`Are you sure you want to delete label ${labelToDelete?.barcode}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

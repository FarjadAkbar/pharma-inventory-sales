"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Calendar,
  RotateCcw,
  Thermometer,
  Signature,
} from "lucide-react"
import { distributionApi } from "@/services"
import { ProofOfDeliveryForm } from "@/components/sales/proof-of-delivery-form"
import { toast } from "sonner"
import type { ProofOfDelivery, PODFilters } from "@/types/distribution"
import { formatDateISO } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function PODPage() {
  const router = useRouter()
  const [pods, setPODs] = useState<ProofOfDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<PODFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [podToDelete, setPodToDelete] = useState<ProofOfDelivery | null>(null)

  useEffect(() => {
    fetchPODs()
  }, [searchQuery, filters, pagination.page])

  const fetchPODs = async () => {
    try {
      setLoading(true)
      const response = await distributionApi.getProofOfDeliveries({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const data = response.data as any
        const list = Array.isArray(data) ? data : data.data ?? data.pods ?? []
        const arr = Array.isArray(list) ? list : []
        setPODs(arr)
        const pag = data.pagination || { page: 1, pages: 1, total: arr.length }
        setPagination({ page: pag.page, pages: pag.pages, total: pag.total ?? arr.length })
      }
    } catch (error) {
      console.error("Failed to fetch PODs:", error)
      toast.error("Failed to load proof of delivery")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as PODFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (pod: ProofOfDelivery) => {
    router.push(`/dashboard/sales/pod/${pod.id}`)
  }

  const handleDelete = (pod: ProofOfDelivery) => {
    setPodToDelete(pod)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!podToDelete) return
    try {
      toast.info("Delete endpoint may not be available")
      setDeleteDialogOpen(false)
      setPodToDelete(null)
    } catch (error) {
      toast.error("Failed to delete POD")
    }
  }

  const handleComplete = async (pod: ProofOfDelivery) => {
    try {
      const response = await distributionApi.completeProofOfDelivery(pod.id, 1)
      if (response.success) {
        toast.success("POD completed successfully")
        fetchPODs()
      } else {
        toast.error("Failed to complete POD")
      }
    } catch (error) {
      console.error("Error completing POD:", error)
      toast.error("Failed to complete POD")
    }
  }

  const getDeliveryStatusBadge = (status: string) => {
    const map: Record<string, { className: string; icon: React.ReactNode }> = {
      Delivered: { className: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      Partial: { className: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
      Rejected: { className: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      Damaged: { className: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
      Returned: { className: "bg-orange-100 text-orange-800", icon: <RotateCcw className="h-3 w-3 mr-1" /> },
    }
    const m = map[status] || { className: "bg-gray-100 text-gray-800", icon: null }
    return <Badge className={m.className}>{m.icon}{status}</Badge>
  }

  const getConditionBadge = (condition: string) => {
    const map: Record<string, string> = {
      Good: "bg-green-100 text-green-800",
      Damaged: "bg-red-100 text-red-800",
      Compromised: "bg-orange-100 text-orange-800",
    }
    return <Badge className={map[condition] || "bg-gray-100 text-gray-800"}>{condition}</Badge>
  }

  const stats = {
    total: pods.length,
    delivered: pods.filter((p) => p.deliveryStatus === "Delivered").length,
    pending: pods.filter((p) => !p.deliveryDate).length,
    other: pods.filter((p) => ["Partial", "Rejected", "Damaged", "Returned"].includes(p.deliveryStatus)).length,
  }

  const columns = [
    {
      key: "podNumber",
      header: "POD #",
      sortable: true,
      render: (pod: ProofOfDelivery) => (
        <div className="font-mono text-sm font-medium text-orange-600">{pod.podNumber}</div>
      ),
    },
    {
      key: "shipment",
      header: "Shipment",
      sortable: true,
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="font-medium">{pod.shipmentNumber}</div>
          <div className="text-muted-foreground">SO: {pod.salesOrderNumber}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (pod: ProofOfDelivery) => (
        <div>
          <div className="font-medium">{pod.accountName}</div>
          <div className="text-sm text-muted-foreground">{pod.accountId}</div>
        </div>
      ),
    },
    {
      key: "delivery",
      header: "Delivery",
      sortable: true,
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {pod.deliveryDate} {pod.deliveryTime}
          </div>
          <div className="text-muted-foreground">By: {pod.deliveredByName}</div>
        </div>
      ),
    },
    {
      key: "receivedBy",
      header: "Received By",
      sortable: true,
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="font-medium">{pod.receivedByName}</div>
          <div className="text-muted-foreground">{pod.receivedByTitle}</div>
        </div>
      ),
    },
    {
      key: "deliveryStatus",
      header: "Status",
      sortable: true,
      render: (pod: ProofOfDelivery) => getDeliveryStatusBadge(pod.deliveryStatus),
    },
    {
      key: "condition",
      header: "Condition",
      sortable: true,
      render: (pod: ProofOfDelivery) => getConditionBadge(pod.conditionAtDelivery),
    },
    {
      key: "temperature",
      header: "Temp",
      sortable: true,
      render: (pod: ProofOfDelivery) => (
        <div className="flex items-center gap-1 text-sm">
          <Thermometer className="h-3 w-3" />
          {pod.temperatureAtDelivery}°C
        </div>
      ),
    },
    {
      key: "signature",
      header: "Signature",
      render: (pod: ProofOfDelivery) => (
        <div className="flex items-center gap-1 text-sm">
          <Signature className="h-3 w-3" />
          {pod.signature ? "Yes" : "No"}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "deliveryStatus",
      label: "Delivery Status",
      type: "select" as const,
      options: [
        { value: "Delivered", label: "Delivered" },
        { value: "Partial", label: "Partial" },
        { value: "Rejected", label: "Rejected" },
        { value: "Damaged", label: "Damaged" },
        { value: "Returned", label: "Returned" },
      ],
    },
    {
      key: "conditionAtDelivery",
      label: "Condition",
      type: "select" as const,
      options: [
        { value: "Good", label: "Good" },
        { value: "Damaged", label: "Damaged" },
        { value: "Compromised", label: "Compromised" },
      ],
    },
  ]

  const actions = (pod: ProofOfDelivery) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleView(pod)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleComplete(pod)} title="Complete">
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(pod)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Proof of Delivery</h1>
            <p className="text-muted-foreground">
              Manage delivery confirmations with signature and documentation
            </p>
          </div>
          <ProofOfDeliveryForm onSuccess={fetchPODs} />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PODs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partial / Rejected / Other</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.other}</div>
            </CardContent>
          </Card>
        </div>

        {/* PODs Table */}
        <UnifiedDataTable
          data={pods}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search PODs..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          onRefresh={fetchPODs}
          onExport={() => console.log("Export PODs")}
          emptyMessage="No proof of delivery records found. Create one to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Proof of Delivery"
          description={`Are you sure you want to delete POD ${podToDelete?.podNumber}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

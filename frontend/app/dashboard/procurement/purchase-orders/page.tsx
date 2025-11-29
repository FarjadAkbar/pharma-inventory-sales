"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  ShoppingCart, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  User
} from "lucide-react"
import Link from "next/link"
import { purchaseOrdersApi, sitesApi } from "@/services"
import type { PurchaseOrder, SupplierOption } from "@/types/purchase-orders"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useAuth } from "@/contexts/auth.context"

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [sites, setSites] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchPurchaseOrders()
    fetchSuppliers()
    fetchSites()
  }, [])

  useEffect(() => {
    if (activeTab === "by-site" && selectedSiteId) {
      fetchPurchaseOrdersBySite(selectedSiteId)
    } else if (activeTab === "all") {
      fetchPurchaseOrders()
    }
  }, [activeTab, selectedSiteId])

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const response = await purchaseOrdersApi.getAllPurchaseOrders()

      if (response.status && response.data) {
        const orders = Array.isArray(response.data) ? response.data : [response.data]
        setPurchaseOrders(orders)
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchaseOrdersBySite = async (siteId: number) => {
    try {
      setLoading(true)
      const response = await purchaseOrdersApi.getPurchaseOrdersBySite(siteId)

      if (response.status && response.data) {
        const orders = Array.isArray(response.data) ? response.data : [response.data]
        setPurchaseOrders(orders)
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders by site:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await purchaseOrdersApi.getSuppliersList()
      if (response.status && response.data) {
        setSuppliers(response.data)
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

  const handleDeletePurchaseOrder = async (po: PurchaseOrder) => {
    if (confirm(`Are you sure you want to delete Purchase Order ${po.id}?`)) {
      try {
        const response = await purchaseOrdersApi.deletePurchaseOrder(po.id)
        if (response.status) {
          fetchPurchaseOrders() // Refresh the list
        } else {
          alert("Failed to delete purchase order")
        }
      } catch (error) {
        console.error("Failed to delete purchase order:", error)
        alert("Failed to delete purchase order")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Completed":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  const calculateStats = () => {
    const total = purchaseOrders.length
    const draft = purchaseOrders.filter(po => po.status === "Draft").length
    const pending = purchaseOrders.filter(po => po.status === "Pending").length
    const approved = purchaseOrders.filter(po => po.status === "Approved").length
    const totalValue = purchaseOrders.reduce((sum, po) => sum + (typeof po.total_amount === 'string' ? parseFloat(po.total_amount) : po.total_amount), 0)

    return { total, draft, pending, approved, totalValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "id",
      header: "PO ID",
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          #{po.id}
        </div>
      ),
    },
    {
      key: "name",
      header: "Site",
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div>
          <div className="font-medium">{po.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {po.location || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "supplier_id",
      header: "Supplier",
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div className="text-sm">
          <div className="font-medium">Supplier #{po.supplier_id}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div className="text-sm">
          <div className="font-medium">{po.items.length} items</div>
          <div className="text-muted-foreground">
            {po.items.reduce((sum, item) => sum + item.qty, 0)} total qty
          </div>
        </div>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div className="text-sm">
          <div className="font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {typeof po.total_amount === 'string' ? po.total_amount : po.total_amount.toLocaleString()} {po.currency}
          </div>
        </div>
      ),
    },
    {
      key: "expected_date",
      header: "Expected Date",
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(po.expected_date).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (po: PurchaseOrder) => getStatusBadge(po.status),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (po: PurchaseOrder) => new Date(po.created_at).toLocaleDateString(),
    },
  ]

  const actions = (po: PurchaseOrder) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="read">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/procurement/purchase-orders/${po.id}/view`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/procurement/purchase-orders/${po.id}/edit`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeletePurchaseOrder(po)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage pharmaceutical purchase orders and procurement</p>
          </div>
          <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="create">
            <Link href="/dashboard/procurement/purchase-orders/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Create PO
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalValue.toLocaleString()} PKR
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="by-site">By Site</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <UnifiedDataTable
              data={purchaseOrders}
              columns={columns}
              loading={loading}
              searchPlaceholder="Search purchase orders..."
              searchValue={searchQuery}
              onSearch={setSearchQuery}
              actions={actions}
              onRefresh={fetchPurchaseOrders}
              onExport={() => console.log("Export purchase orders")}
              emptyMessage="No purchase orders found. Create your first purchase order to get started."
            />
          </TabsContent>

          <TabsContent value="by-site" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Select
                value={selectedSiteId?.toString() || ""}
                onValueChange={(value) => setSelectedSiteId(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a site" />
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
            <UnifiedDataTable
              data={purchaseOrders}
              columns={columns}
              loading={loading}
              searchPlaceholder="Search purchase orders..."
              searchValue={searchQuery}
              onSearch={setSearchQuery}
              actions={actions}
              onRefresh={() => selectedSiteId ? fetchPurchaseOrdersBySite(selectedSiteId) : fetchPurchaseOrders()}
              onExport={() => console.log("Export purchase orders")}
              emptyMessage="No purchase orders found for the selected site."
            />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {supplier.id}</div>
                      </div>
                    </div>
                  ))}
                  {suppliers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No suppliers found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

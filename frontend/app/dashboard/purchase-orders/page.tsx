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
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form"
import type { PurchaseOrder, ProcurementApiResponse } from "@/types/procurement"

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    fetchPurchaseOrders()
  }, [searchQuery, pagination.page])

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      if (searchQuery) searchParams.set("search", searchQuery)
      searchParams.set("page", pagination.page.toString())
      searchParams.set("limit", "10")

      const response = await fetch(`/api/procurement/purchase-orders?${searchParams.toString()}`)
      const data: ProcurementApiResponse<{ purchaseOrders: PurchaseOrder[]; pagination: any }> = await response.json()
      
      if (data.success && data.data) {
        setPurchaseOrders(data.data.purchaseOrders)
        setPagination({
          page: data.data.pagination.page,
          pages: data.data.pagination.totalPages,
          total: data.data.pagination.total,
        })
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error)
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

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO(po)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingPO(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPO(null)
  }

  const handleSubmit = async (data: {
    supplierId: number
    siteId?: number
    expectedDate: string
    items: Array<{
      rawMaterialId: number
      quantity: number
      unitPrice: number
    }>
    status?: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled'
  }) => {
    try {
      const method = editingPO ? "PUT" : "POST"
      const body = editingPO
        ? {
            id: editingPO.id,
            supplierId: data.supplierId,
            siteId: data.siteId,
            expectedDate: data.expectedDate,
            items: data.items.map(item => ({
              materialId: item.rawMaterialId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
            status: data.status,
          }
        : {
            supplierId: data.supplierId,
            siteId: data.siteId,
            expectedDate: data.expectedDate,
            items: data.items.map(item => ({
              materialId: item.rawMaterialId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
            status: data.status,
          }

      const response = await fetch("/api/procurement/purchase-orders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result: ProcurementApiResponse<PurchaseOrder> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save purchase order")
      }

      handleCloseModal()
      fetchPurchaseOrders()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
      throw error
    }
  }

  const handleDelete = (po: PurchaseOrder) => {
    setPoToDelete(po)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!poToDelete) return
    
    try {
      const response = await fetch(`/api/procurement/purchase-orders?id=${poToDelete.id}`, {
        method: "DELETE",
      })

      const result: ProcurementApiResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete purchase order")
      }

      fetchPurchaseOrders()
      setDeleteDialogOpen(false)
      setPoToDelete(null)
    } catch (error) {
      console.error("Failed to delete purchase order:", error)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setPoToDelete(null)
  }

  const handleApprove = async (po: PurchaseOrder) => {
    try {
      const response = await fetch(`/api/procurement/purchase-orders?id=${po.id}&action=approve`, {
        method: "PATCH",
      })

      const result: ProcurementApiResponse<PurchaseOrder> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to approve purchase order")
      }

      fetchPurchaseOrders()
    } catch (error) {
      console.error("Failed to approve purchase order:", error)
    }
  }

  const handleCancel = async (po: PurchaseOrder) => {
    try {
      const response = await fetch(`/api/procurement/purchase-orders?id=${po.id}&action=cancel`, {
        method: "PATCH",
      })

      const result: ProcurementApiResponse<PurchaseOrder> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to cancel purchase order")
      }

      fetchPurchaseOrders()
    } catch (error) {
      console.error("Failed to cancel purchase order:", error)
    }
  }

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Draft': 'secondary',
      'Pending': 'outline',
      'Pending Approval': 'outline',
      'Approved': 'default',
      'Received': 'default',
      'Fully Received': 'default',
      'Partially Received': 'default',
      'Cancelled': 'destructive',
      'Rejected': 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const columns = [
    {
      key: "poNumber",
      header: "PO Number",
      render: (po: PurchaseOrder) => (
        <div className="font-medium">{po.poNumber}</div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (po: PurchaseOrder) => (
        <div className="text-sm">
          {po.supplierName || `Supplier #${po.supplierId}`}
        </div>
      ),
    },
    {
      key: "site",
      header: "Site",
      render: (po: PurchaseOrder) => (
        <div className="text-sm text-muted-foreground">
          {po.siteName || "-"}
        </div>
      ),
    },
    {
      key: "expectedDate",
      header: "Expected Date",
      render: (po: PurchaseOrder) => formatDateISO(po.expectedDate),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (po: PurchaseOrder) => (
        <div className="font-medium">{po.currency} {Number(po.totalAmount).toFixed(2)}</div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (po: PurchaseOrder) => (
        <div className="text-sm text-muted-foreground">
          {po.items?.length || 0} item(s)
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (po: PurchaseOrder) => getStatusBadge(po.status),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (po: PurchaseOrder) => formatDateISO(po.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage purchase orders for raw materials</p>
          </div>

          <PermissionGuard module="PROCUREMENT" action="create">
            <Button onClick={handleAdd}>
              <Plus />
              Create Purchase Order
            </Button>
          </PermissionGuard>
        </div>

        {/* Purchase Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
            <CardDescription>A list of all purchase orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={purchaseOrders}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search purchase orders..."
              actions={[
                {
                  label: "Edit",
                  onClick: (po: PurchaseOrder) => handleEdit(po),
                  variant: "outline" as const,
                },
                {
                  label: "Approve",
                  onClick: (po: PurchaseOrder) => handleApprove(po),
                  variant: "default" as const,
                  condition: (po: PurchaseOrder) => po.status === 'Pending' || po.status === 'Pending Approval' || po.status === 'Draft',
                },
                {
                  label: "Cancel",
                  onClick: (po: PurchaseOrder) => handleCancel(po),
                  variant: "destructive" as const,
                  condition: (po: PurchaseOrder) => po.status !== 'Cancelled' && po.status !== 'Fully Received',
                },
                {
                  label: "Delete",
                  onClick: (po: PurchaseOrder) => handleDelete(po),
                  variant: "destructive" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Purchase Order Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPO ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
              <DialogDescription>
                {editingPO ? "Update purchase order information" : "Create a new purchase order"}
              </DialogDescription>
            </DialogHeader>
            <PurchaseOrderForm
              initialData={editingPO ? {
                id: Number(editingPO.id),
                poNumber: editingPO.poNumber,
                supplierId: Number(editingPO.supplierId),
                siteId: editingPO.siteId ? Number(editingPO.siteId) : undefined,
                expectedDate: editingPO.expectedDate,
                status: editingPO.status as any,
                totalAmount: editingPO.totalAmount,
                items: editingPO.items?.map(item => ({
                  id: Number(item.id || 0),
                  purchaseOrderId: Number(editingPO.id),
                  rawMaterialId: Number(item.materialId),
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  rawMaterial: {
                    id: Number(item.materialId),
                    name: item.materialName,
                    code: item.materialCode,
                  },
                })) || [],
              } : undefined}
              onSubmit={handleSubmit}
              submitLabel={editingPO ? "Save Changes" : "Create Purchase Order"}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Purchase Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the purchase order "{poToDelete?.poNumber}"? This action cannot be undone.
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
      </div>
    </DashboardLayout>
  )
}

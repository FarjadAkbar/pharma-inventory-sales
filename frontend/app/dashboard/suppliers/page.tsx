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
import { Plus, Star } from "lucide-react"
import { suppliersApi, type Supplier } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [searchQuery, pagination.page])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await suppliersApi.getSuppliers({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })
      
      setSuppliers(response)
      setPagination({ page: pagination.page, pages: 1, total: response.length })
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
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

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingSupplier(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSupplier(null)
  }

  const handleSubmit = async (data: {
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
    rating?: number
    status?: 'Active' | 'Inactive'
    siteIds?: number[]
  }) => {
    try {
      if (editingSupplier) {
        await suppliersApi.updateSupplier(editingSupplier.id.toString(), data)
      } else {
        await suppliersApi.createSupplier(data)
      }
      handleCloseModal()
      fetchSuppliers()
      suppliersApi.invalidateSuppliers()
    } catch (error) {
      console.error("Failed to save supplier:", error)
      throw error
    }
  }

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!supplierToDelete) return
    
    try {
      await suppliersApi.deleteSupplier(supplierToDelete.id.toString())
      fetchSuppliers()
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
      suppliersApi.invalidateSuppliers()
    } catch (error) {
      console.error("Failed to delete supplier:", error)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setSupplierToDelete(null)
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const columns = [
    {
      key: "name",
      header: "Supplier Name",
      render: (supplier: Supplier) => (
        <div className="font-medium">{supplier.name}</div>
      ),
    },
    {
      key: "contactPerson",
      header: "Contact Person",
      render: (supplier: Supplier) => (
        <div className="text-sm">{supplier.contactPerson}</div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (supplier: Supplier) => (
        <div className="text-sm text-muted-foreground">{supplier.email}</div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (supplier: Supplier) => (
        <div className="text-sm">{supplier.phone}</div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-2">
          <div className="flex">{getRatingStars(supplier.rating || 0)}</div>
          <span className="text-sm font-medium">{supplier.rating?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (supplier: Supplier) => (
        <Badge variant={supplier.status === 'Active' ? "default" : "secondary"}>
          {supplier.status}
        </Badge>
      ),
    },
    {
      key: "sites",
      header: "Sites",
      render: (supplier: Supplier) => (
        <div className="text-sm text-muted-foreground">
          {supplier.sites && supplier.sites.length > 0
            ? supplier.sites.map(s => s.name).join(", ")
            : supplier.siteIds && supplier.siteIds.length > 0
            ? `${supplier.siteIds.length} site(s)`
            : "-"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (supplier: Supplier) => formatDateISO(supplier.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">Manage pharmaceutical suppliers and their performance</p>
          </div>

          <PermissionGuard module="MASTER_DATA" action="create">
            <Button onClick={handleAdd}>
              <Plus />
              Add Supplier
            </Button>
          </PermissionGuard>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Suppliers</CardTitle>
            <CardDescription>A list of all suppliers in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={suppliers}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search suppliers..."
              actions={[
                {
                  label: "Edit",
                  onClick: (supplier: Supplier) => handleEdit(supplier),
                  variant: "outline" as const,
                },
                {
                  label: "Delete",
                  onClick: (supplier: Supplier) => handleDelete(supplier),
                  variant: "destructive" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Supplier Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Create a new supplier"}
              </DialogDescription>
            </DialogHeader>
            <SupplierForm
              initialData={editingSupplier || undefined}
              onSubmit={handleSubmit}
              submitLabel={editingSupplier ? "Save Changes" : "Create Supplier"}
            />
          </DialogContent>
        </Dialog>
      </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Supplier</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the supplier "{supplierToDelete?.name}"? This action cannot be undone.
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

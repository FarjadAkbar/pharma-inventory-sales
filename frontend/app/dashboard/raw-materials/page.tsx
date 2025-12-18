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
import { rawMaterialsApi, type RawMaterial } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"
import { RawMaterialForm } from "@/components/raw-materials/raw-material-form"

export default function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRawMaterial, setEditingRawMaterial] = useState<RawMaterial | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rawMaterialToDelete, setRawMaterialToDelete] = useState<RawMaterial | null>(null)

  useEffect(() => {
    fetchRawMaterials()
  }, [searchQuery, pagination.page])

  const fetchRawMaterials = async () => {
    try {
      setLoading(true)
      const response = await rawMaterialsApi.getRawMaterials({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })
      
      setRawMaterials(response)
      setPagination({ page: pagination.page, pages: 1, total: response.length })
    } catch (error) {
      console.error("Failed to fetch raw materials:", error)
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

  const handleEdit = (rawMaterial: RawMaterial) => {
    setEditingRawMaterial(rawMaterial)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRawMaterial(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRawMaterial(null)
  }

  const handleSubmit = async (data: {
    code: string
    name: string
    description?: string
    grade?: string
    storageRequirements?: string
    unitOfMeasure?: string
    supplierId: number
    status?: 'Active' | 'InActive'
  }) => {
    try {
      if (editingRawMaterial) {
        await rawMaterialsApi.updateRawMaterial(editingRawMaterial.id.toString(), data)
      } else {
        await rawMaterialsApi.createRawMaterial(data)
      }
      handleCloseModal()
      fetchRawMaterials()
      rawMaterialsApi.invalidateRawMaterials()
    } catch (error) {
      console.error("Failed to save raw material:", error)
      throw error
    }
  }

  const handleDelete = (rawMaterial: RawMaterial) => {
    setRawMaterialToDelete(rawMaterial)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!rawMaterialToDelete) return
    
    try {
      await rawMaterialsApi.deleteRawMaterial(rawMaterialToDelete.id.toString())
      fetchRawMaterials()
      setDeleteDialogOpen(false)
      setRawMaterialToDelete(null)
      rawMaterialsApi.invalidateRawMaterials()
    } catch (error) {
      console.error("Failed to delete raw material:", error)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setRawMaterialToDelete(null)
  }

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (rm: RawMaterial) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {rm.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Material Name",
      render: (rm: RawMaterial) => (
        <div>
          <div className="font-medium">{rm.name}</div>
          {rm.description && (
            <div className="text-sm text-muted-foreground">{rm.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (rm: RawMaterial) => (
        rm.grade ? (
          <Badge className="bg-blue-100 text-blue-800">
            {rm.grade}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "storageRequirements",
      header: "Storage",
      render: (rm: RawMaterial) => (
        <div className="text-sm text-muted-foreground">
          {rm.storageRequirements || "-"}
        </div>
      ),
    },
    {
      key: "unitOfMeasure",
      header: "Unit",
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          {rm.unitOfMeasure || "-"}
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          <div className="font-medium">{rm.supplier?.name || `ID: ${rm.supplierId}`}</div>
          {rm.supplier?.contactPerson && (
            <div className="text-muted-foreground">{rm.supplier.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (rm: RawMaterial) => (
        <Badge variant={rm.status === 'Active' ? "default" : "secondary"}>
          {rm.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (rm: RawMaterial) => formatDateISO(rm.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raw Materials</h1>
            <p className="text-muted-foreground">Manage pharmaceutical raw materials and excipients</p>
          </div>

          <PermissionGuard module="MASTER_DATA" action="create">
            <Button onClick={handleAdd}>
              <Plus />
              Add Raw Material
            </Button>
          </PermissionGuard>
        </div>

        {/* Raw Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Raw Materials</CardTitle>
            <CardDescription>A list of all raw materials in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={rawMaterials}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search raw materials..."
              actions={[
                {
                  label: "Edit",
                  onClick: (rm: RawMaterial) => handleEdit(rm),
                  variant: "outline" as const,
                },
                {
                  label: "Delete",
                  onClick: (rm: RawMaterial) => handleDelete(rm),
                  variant: "destructive" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Raw Material Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRawMaterial ? "Edit Raw Material" : "Add New Raw Material"}</DialogTitle>
              <DialogDescription>
                {editingRawMaterial ? "Update raw material information" : "Create a new raw material"}
              </DialogDescription>
            </DialogHeader>
            <RawMaterialForm
              initialData={editingRawMaterial || undefined}
              onSubmit={handleSubmit}
              submitLabel={editingRawMaterial ? "Save Changes" : "Create Raw Material"}
            />
          </DialogContent>
        </Dialog>
      </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Raw Material</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the raw material "{rawMaterialToDelete?.name}"? This action cannot be undone.
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

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, Mail, Phone, Edit, Trash2 } from "lucide-react"
import { apiService } from "@/services/api.service"
import type { Vendor } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { usePermissions } from "@/hooks/use-permissions"
import { AccessDenied } from "@/components/ui/access-denied"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
  })

  const { can } = usePermissions()

  useEffect(() => {
    fetchVendors()
  }, [searchQuery, pagination.page])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await apiService.getVendors({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setVendors(response.data.vendors)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error)
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

  const handleDelete = async (vendor: Vendor) => {
    if (confirm(`Are you sure you want to delete the vendor "${vendor.name}"?`)) {
      try {
        await apiService.deleteVendor(vendor.id)
        fetchVendors()
        apiService.invalidateVendors()
      } catch (error) {
        console.error("Failed to delete vendor:", error)
      }
    }
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      contactPerson: vendor.contactPerson,
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
    })
    setEditingVendor(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingVendor) {
        await apiService.updateVendor(editingVendor.id, formData)
      } else {
        await apiService.createVendor(formData)
      }
      setIsAddDialogOpen(false)
      resetForm()
      fetchVendors()
      apiService.invalidateVendors()
    } catch (error) {
      console.error("Failed to save vendor:", error)
    }
  }

  const columns = [
    {
      key: "name",
      header: "Vendor Name",
      render: (vendor: Vendor) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{vendor.name}</div>
            <div className="text-sm text-muted-foreground">{vendor.contactPerson}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact Info",
      render: (vendor: Vendor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3" />
            {vendor.email}
          </div>
          {vendor.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              {vendor.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (vendor: Vendor) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">{vendor.address || "N/A"}</div>
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      render: (vendor: Vendor) => new Date(vendor.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (vendor: Vendor) => (
        <div className="flex items-center gap-1">
          <PermissionGuard permission="edit_vendors">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>
              <Edit className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="delete_vendors">
            <Button variant="ghost" size="sm" onClick={() => handleDelete(vendor)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ]

  if (!can("view_vendors")) {
    return <AccessDenied title="Vendors Access Denied" description="You don't have permission to view vendors." />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground">Manage your supplier relationships</p>
          </div>

          <PermissionGuard permission="create_vendors">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                  <DialogDescription>
                    {editingVendor
                      ? "Update vendor information"
                      : "Create a new vendor profile for your supplier network"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingVendor ? "Update Vendor" : "Add Vendor"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Directory</CardTitle>
            <CardDescription>View and manage all your suppliers and vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={vendors}
              columns={columns}
              searchPlaceholder="Search vendors..."
              onSearch={handleSearch}
              pagination={{
                ...pagination,
                onPageChange: handlePageChange,
              }}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

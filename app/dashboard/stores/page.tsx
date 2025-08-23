"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { MultiModulePermissionGuard } from "@/components/auth/permission-guard"
import { useAuth } from "@/contexts/auth.context"
import { apiService } from "@/services/api.service"

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: "", city: "", address: "", image: "" })
  const { user } = useAuth()

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiService.getStores()
      if (res.success && res.data) setStores(res.data as any[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Check if user has view permission for stores in either POS or PHARMA module
  const hasViewPermission = user?.permissions?.POS?.store?.canView || user?.permissions?.PHARMA?.store?.canView
  
  if (!user) {
    return <div className="p-4">You must be logged in to view this page.</div>
  }
  
  if (!hasViewPermission) {
    return <div className="p-4">Access denied</div>
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await apiService.updateStore(editing.id, form)
    } else {
      await apiService.createStore(form)
    }
    setOpen(false)
    setEditing(null)
    setForm({ name: "", city: "", address: "", image: "" })
    load()
  }

  const onEdit = (row: any) => {
    setEditing(row)
    setForm({ name: row.name, city: row.city, address: row.address, image: row.image || "" })
    setOpen(true)
  }

  const onDelete = async (row: any) => {
    if (!confirm(`Delete store ${row.name}?`)) return
    await apiService.deleteStore(row.id)
    load()
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "city", header: "City" },
    { key: "address", header: "Address" },
  ]

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stores</CardTitle>
          <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="store" action="create">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditing(null)
                    setForm({ name: "", city: "", address: "", image: "" })
                  }}
                >
                  Add Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Store" : "Add Store"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="submit">{editing ? "Save" : "Create"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </MultiModulePermissionGuard>
        </CardHeader>
        <CardContent>
          <DataTable
            data={stores}
            columns={columns as any}
            loading={loading}
            actions={(row: any) => (
              <div className="flex gap-2">
                <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="store" action="update">
                  <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
                    Edit
                  </Button>
                </MultiModulePermissionGuard>
                <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="store" action="delete">
                  <Button variant="destructive" size="sm" onClick={() => onDelete(row)}>
                    Delete
                  </Button>
                </MultiModulePermissionGuard>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}



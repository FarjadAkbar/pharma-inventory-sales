"use client"

import type React from "react"
import { formatDateISO } from "@/lib/utils"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, Edit, Trash2 } from "lucide-react"
import type { Category } from "@/lib/mock-data"
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
import { MultiModulePermissionGuard } from "@/components/auth/permission-guard"
import { useAuth } from "@/contexts/auth.context"
import { AccessDenied } from "@/components/ui/access-denied"
import { apiService } from "@/services/api.service"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    })
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update existing category
        await apiService.updateCategory(editingCategory.id, formData)
      } else {
        // Add new category
        await apiService.createCategory(formData)
      }

      setIsAddDialogOpen(false)
      resetForm()
      fetchCategories()
      apiService.invalidateCategories()
    } catch (error) {
      console.error("Failed to save category:", error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      try {
        await apiService.deleteCategory(category.id)
        fetchCategories()
        apiService.invalidateCategories()
      } catch (error) {
        console.error("Failed to delete category:", error)
      }
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await apiService.getCategories({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setCategories(response.data.categories)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const { user } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [searchQuery, pagination.page])

  if (!user) {
    return <AccessDenied title="Access Denied" description="You must be logged in to view this page." />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Organize your products with categories</p>
          </div>

          <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="category" action="create">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                  <DialogDescription>
                    {editingCategory ? "Update category information" : "Create a new product category"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingCategory ? "Update Category" : "Add Category"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </MultiModulePermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="category" action="update">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </MultiModulePermissionGuard>
                        <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="category" action="delete">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </MultiModulePermissionGuard>
                      </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{category.description}</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Created: {formatDateISO(category.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {categories.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">Create your first product category to get started</p>
              <MultiModulePermissionGuard modules={["POS", "PHARMA"]} screen="category" action="create">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus />
                  Add Category
                </Button>
              </MultiModulePermissionGuard>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

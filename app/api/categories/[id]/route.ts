import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockCategories } from "@/lib/mock-data"
import { validateText } from "@/lib/validations"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const categoryData = await request.json()
      const { name, description } = categoryData

      if (!name) {
        return Response.json({ success: false, error: "Category name is required" }, { status: 400 })
      }

      if (!validateText(name, 2, 50)) {
        return Response.json({ success: false, error: "Name must be between 2 and 50 characters" }, { status: 400 })
      }

      const categoryIndex = mockCategories.findIndex((c) => c.id === params.id)
      if (categoryIndex === -1) {
        return Response.json({ success: false, error: "Category not found" }, { status: 404 })
      }

      // Check if another category with the same name exists
      const existingCategory = mockCategories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== params.id,
      )
      if (existingCategory) {
        return Response.json({ success: false, error: "Category with this name already exists" }, { status: 409 })
      }

      mockCategories[categoryIndex] = {
        ...mockCategories[categoryIndex],
        name,
        description: description || "",
        updatedAt: new Date().toISOString(),
      }

      return Response.json({
        success: true,
        data: mockCategories[categoryIndex],
      })
    } catch (error) {
      console.error("Update category error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const categoryIndex = mockCategories.findIndex((c) => c.id === params.id)
      if (categoryIndex === -1) {
        return Response.json({ success: false, error: "Category not found" }, { status: 404 })
      }

      const deletedCategory = mockCategories.splice(categoryIndex, 1)[0]

      return Response.json({
        success: true,
        data: deletedCategory,
      })
    } catch (error) {
      console.error("Delete category error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockCategories } from "@/lib/mock-data"
import { validateText } from "@/lib/validations"
import type { Category } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  return requireAuth(["admin", "client_admin", "manager", "user"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredCategories = [...mockCategories]

      // Apply search filter
      if (search) {
        filteredCategories = filteredCategories.filter(
          (category) =>
            category.name.toLowerCase().includes(search.toLowerCase()) ||
            category.description.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

      return Response.json({
        success: true,
        data: {
          categories: paginatedCategories,
          pagination: {
            page,
            limit,
            total: filteredCategories.length,
            pages: Math.ceil(filteredCategories.length / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get categories error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["admin", "client_admin", "manager"])(request, async (req, user) => {
    try {
      const categoryData = await request.json()

      // Validation
      const { name, description } = categoryData

      if (!name) {
        return Response.json({ success: false, error: "Category name is required" }, { status: 400 })
      }

      if (!validateText(name, 2, 50)) {
        return Response.json({ success: false, error: "Name must be between 2 and 50 characters" }, { status: 400 })
      }

      // Check if category already exists
      const existingCategory = mockCategories.find((c) => c.name.toLowerCase() === name.toLowerCase())
      if (existingCategory) {
        return Response.json({ success: false, error: "Category with this name already exists" }, { status: 409 })
      }

      const newCategory: Category = {
        id: (mockCategories.length + 1).toString(),
        name,
        description: description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockCategories.push(newCategory)

      return Response.json({
        success: true,
        data: newCategory,
      })
    } catch (error) {
      console.error("Create category error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

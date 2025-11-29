import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  return requireAuth()(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const category = searchParams.get("category")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      const storeId = req.headers.get("x-store-id")
      if (user.role !== "admin" && user.role !== "client_admin") {
        if (!storeId || !(user as any).assignedStores?.includes(storeId)) {
          return Response.json({ success: false, error: "Store access denied" }, { status: 403 })
        }
      }

      let filteredProducts = [...mockProducts].filter((p) => (storeId ? p.storeId === storeId : true))

      // Apply search filter
      if (search) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Apply category filter
      if (category) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category.toLowerCase() === category.toLowerCase(),
        )
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

      return Response.json({
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            page,
            limit,
            total: filteredProducts.length,
            pages: Math.ceil(filteredProducts.length / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get products error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["admin", "client_admin", "store_manager", "employee"])(request, async (req, user) => {
    try {
      const productData = await request.json()

      const storeId = req.headers.get("x-store-id")
      if (!storeId || (user.role !== "admin" && user.role !== "client_admin" && !(user as any).assignedStores?.includes(storeId))) {
        return Response.json({ success: false, error: "Store access denied" }, { status: 403 })
      }

      // Validation
      const { name, description, price, category, vendor, stock, sku } = productData

      if (!name || !price || !category || !vendor || !sku) {
        return Response.json(
          { success: false, error: "Name, price, category, vendor, and SKU are required" },
          { status: 400 },
        )
      }

      // Check if SKU already exists in the same store
      const existingProduct = mockProducts.find((p) => p.sku === sku && p.storeId === storeId)
      if (existingProduct) {
        return Response.json({ success: false, error: "Product with this SKU already exists" }, { status: 409 })
      }

      const newProduct: Product = {
        id: (mockProducts.length + 1).toString(),
        name,
        description: description || "",
        price: Number.parseFloat(price),
        category,
        vendor,
        stock: Number.parseInt(stock) || 0,
        sku,
        storeId,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockProducts.push(newProduct)

      return Response.json({
        success: true,
        data: newProduct,
      })
    } catch (error) {
      console.error("Create product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockProducts } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth()(request, async (req, user) => {
    try {
      const product = mockProducts.find((p) => p.id === params.id)

      if (!product) {
        return Response.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const storeId = req.headers.get("x-store-id")
      if (user.role !== "admin") {
        if (!storeId || !(user as any).assignedStores?.includes(storeId) || product.storeId !== storeId) {
          return Response.json({ success: false, error: "Store access denied" }, { status: 403 })
        }
      }

      return Response.json({ success: true, data: product })
    } catch (error) {
      console.error("Get product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "store_manager", "employee"])(request, async (req, user) => {
    try {
      const productIndex = mockProducts.findIndex((p) => p.id === params.id)

      if (productIndex === -1) {
        return Response.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const updateData = await request.json()
      const existingProduct = mockProducts[productIndex]

      const storeId = req.headers.get("x-store-id")
      if (user.role !== "admin") {
        if (!storeId || !(user as any).assignedStores?.includes(storeId) || existingProduct.storeId !== storeId) {
          return Response.json({ success: false, error: "Store access denied" }, { status: 403 })
        }
        if (user.role === "employee" && existingProduct.createdBy !== user.id) {
          return Response.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
        }
      }

      // Update product (preserve identity and store ownership fields)
      mockProducts[productIndex] = {
        ...existingProduct,
        ...updateData,
        id: existingProduct.id,
        storeId: existingProduct.storeId,
        createdBy: existingProduct.createdBy,
        updatedAt: new Date().toISOString(),
      }

      return Response.json({ success: true, data: mockProducts[productIndex] })
    } catch (error) {
      console.error("Update product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "store_manager", "employee"])(request, async (req, user) => {
    try {
      const productIndex = mockProducts.findIndex((p) => p.id === params.id)

      if (productIndex === -1) {
        return Response.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const product = mockProducts[productIndex]
      const storeId = req.headers.get("x-store-id")
      if (user.role !== "admin") {
        if (!storeId || !(user as any).assignedStores?.includes(storeId) || product.storeId !== storeId) {
          return Response.json({ success: false, error: "Store access denied" }, { status: 403 })
        }
        if (user.role === "employee" && product.createdBy !== user.id) {
          return Response.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
        }
      }

      const deletedProduct = mockProducts.splice(productIndex, 1)[0]

      return Response.json({ success: true, data: deletedProduct, message: "Product deleted successfully" })
    } catch (error) {
      console.error("Delete product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

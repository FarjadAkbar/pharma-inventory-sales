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

      return Response.json({
        success: true,
        data: product,
      })
    } catch (error) {
      console.error("Get product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const productIndex = mockProducts.findIndex((p) => p.id === params.id)

      if (productIndex === -1) {
        return Response.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const updateData = await request.json()
      const existingProduct = mockProducts[productIndex]

      // Update product
      mockProducts[productIndex] = {
        ...existingProduct,
        ...updateData,
        id: existingProduct.id, // Prevent ID change
        updatedAt: new Date().toISOString(),
      }

      return Response.json({
        success: true,
        data: mockProducts[productIndex],
      })
    } catch (error) {
      console.error("Update product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const productIndex = mockProducts.findIndex((p) => p.id === params.id)

      if (productIndex === -1) {
        return Response.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const deletedProduct = mockProducts.splice(productIndex, 1)[0]

      return Response.json({
        success: true,
        data: deletedProduct,
        message: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Delete product error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

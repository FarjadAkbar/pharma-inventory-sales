import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockPurchaseOrders } from "@/lib/procurement-mock-data"
import { validateText } from "@/lib/validations"
import type { PurchaseOrder, POFilters, ProcurementApiResponse } from "@/types/procurement"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const supplierId = searchParams.get("supplierId")
      const status = searchParams.get("status")
      const siteId = searchParams.get("siteId")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const amountMin = searchParams.get("amountMin")
      const amountMax = searchParams.get("amountMax")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredPOs = [...mockPurchaseOrders]

      // Apply search filter
      if (search) {
        filteredPOs = filteredPOs.filter(
          (po) =>
            po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
            po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
            po.siteName.toLowerCase().includes(search.toLowerCase()) ||
            po.createdByName.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (supplierId) {
        filteredPOs = filteredPOs.filter((po) => po.supplierId === supplierId)
      }

      if (status) {
        filteredPOs = filteredPOs.filter((po) => po.status === status)
      }

      if (siteId) {
        filteredPOs = filteredPOs.filter((po) => po.siteId === siteId)
      }

      if (dateFrom) {
        filteredPOs = filteredPOs.filter((po) => po.createdAt >= dateFrom)
      }

      if (dateTo) {
        filteredPOs = filteredPOs.filter((po) => po.createdAt <= dateTo)
      }

      if (amountMin) {
        const minAmount = Number(amountMin)
        filteredPOs = filteredPOs.filter((po) => po.totalAmount >= minAmount)
      }

      if (amountMax) {
        const maxAmount = Number(amountMax)
        filteredPOs = filteredPOs.filter((po) => po.totalAmount <= maxAmount)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPOs = filteredPOs.slice(startIndex, endIndex)

      const response: ProcurementApiResponse<{ purchaseOrders: PurchaseOrder[]; pagination: any }> = {
        success: true,
        data: {
          purchaseOrders: paginatedPOs,
          pagination: {
            page,
            limit,
            total: filteredPOs.length,
            totalPages: Math.ceil(filteredPOs.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get purchase orders error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const poData = await request.json()

      // Validation
      const { supplierId, siteId, expectedDate, items } = poData

      if (!supplierId || !siteId || !expectedDate || !items || items.length === 0) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      // Generate PO number
      const poNumber = `PO-${new Date().getFullYear()}-${String(mockPurchaseOrders.length + 1).padStart(3, '0')}`

      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)

      const newPO: PurchaseOrder = {
        id: (mockPurchaseOrders.length + 1).toString(),
        poNumber,
        supplierId,
        supplierName: poData.supplierName || "Unknown Supplier",
        siteId,
        siteName: poData.siteName || "Unknown Site",
        expectedDate,
        status: "Draft",
        totalAmount,
        currency: "PKR",
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          materialId: item.materialId,
          materialName: item.materialName,
          materialCode: item.materialCode,
          quantity: item.quantity,
          unitId: item.unitId,
          unitName: item.unitName,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          receivedQuantity: 0,
          pendingQuantity: item.quantity,
          status: "Pending"
        })),
        notes: poData.notes,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockPurchaseOrders.push(newPO)

      const response: ProcurementApiResponse<PurchaseOrder> = {
        success: true,
        data: newPO,
        message: "Purchase order created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create purchase order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const poData = await request.json()
      const { id, ...updateData } = poData

      const poIndex = mockPurchaseOrders.findIndex((po) => po.id === id)
      if (poIndex === -1) {
        return Response.json({ success: false, error: "Purchase order not found" }, { status: 404 })
      }

      // Update PO
      mockPurchaseOrders[poIndex] = {
        ...mockPurchaseOrders[poIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: ProcurementApiResponse<PurchaseOrder> = {
        success: true,
        data: mockPurchaseOrders[poIndex],
        message: "Purchase order updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update purchase order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")

      if (!id) {
        return Response.json({ success: false, error: "Purchase order ID is required" }, { status: 400 })
      }

      const poIndex = mockPurchaseOrders.findIndex((po) => po.id === id)
      if (poIndex === -1) {
        return Response.json({ success: false, error: "Purchase order not found" }, { status: 404 })
      }

      const deletedPO = mockPurchaseOrders.splice(poIndex, 1)[0]

      const response: ProcurementApiResponse<PurchaseOrder> = {
        success: true,
        data: deletedPO,
        message: "Purchase order deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete purchase order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

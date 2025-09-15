import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockGoodsReceipts } from "@/lib/procurement-mock-data"
import { validateText } from "@/lib/validations"
import type { GoodsReceipt, GRNFilters, ProcurementApiResponse } from "@/types/procurement"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "warehouse_ops", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const poId = searchParams.get("poId")
      const supplierId = searchParams.get("supplierId")
      const status = searchParams.get("status")
      const siteId = searchParams.get("siteId")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredGRNs = [...mockGoodsReceipts]

      // Apply search filter
      if (search) {
        filteredGRNs = filteredGRNs.filter(
          (grn) =>
            grn.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
            grn.poNumber.toLowerCase().includes(search.toLowerCase()) ||
            grn.supplierName.toLowerCase().includes(search.toLowerCase()) ||
            grn.siteName.toLowerCase().includes(search.toLowerCase()) ||
            grn.receivedByName.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (poId) {
        filteredGRNs = filteredGRNs.filter((grn) => grn.poId === poId)
      }

      if (supplierId) {
        filteredGRNs = filteredGRNs.filter((grn) => grn.supplierId === supplierId)
      }

      if (status) {
        filteredGRNs = filteredGRNs.filter((grn) => grn.status === status)
      }

      if (siteId) {
        filteredGRNs = filteredGRNs.filter((grn) => grn.siteId === siteId)
      }

      if (dateFrom) {
        filteredGRNs = filteredGRNs.filter((grn) => grn.receivedDate >= dateFrom)
      }

      if (dateTo) {
        filteredGRNs = filteredGRNs.filter((grn) => grn.receivedDate <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedGRNs = filteredGRNs.slice(startIndex, endIndex)

      const response: ProcurementApiResponse<{ goodsReceipts: GoodsReceipt[]; pagination: any }> = {
        success: true,
        data: {
          goodsReceipts: paginatedGRNs,
          pagination: {
            page,
            limit,
            total: filteredGRNs.length,
            totalPages: Math.ceil(filteredGRNs.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get goods receipts error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const grnData = await request.json()

      // Validation
      const { poId, items } = grnData

      if (!poId || !items || items.length === 0) {
        return Response.json({ success: false, error: "PO ID and items are required" }, { status: 400 })
      }

      // Generate GRN number
      const grnNumber = `GRN-${new Date().getFullYear()}-${String(mockGoodsReceipts.length + 1).padStart(3, '0')}`

      const newGRN: GoodsReceipt = {
        id: (mockGoodsReceipts.length + 1).toString(),
        grnNumber,
        poId,
        poNumber: grnData.poNumber || "Unknown PO",
        supplierId: grnData.supplierId || "",
        supplierName: grnData.supplierName || "Unknown Supplier",
        siteId: grnData.siteId || "",
        siteName: grnData.siteName || "Unknown Site",
        receivedDate: new Date().toISOString(),
        receivedBy: user.userId.toString(),
        receivedByName: user.name || "Unknown User",
        status: "Pending QC",
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          poItemId: item.poItemId,
          materialId: item.materialId,
          materialName: item.materialName,
          materialCode: item.materialCode,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unitId: item.unitId,
          unitName: item.unitName,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          condition: item.condition || "Good",
          remarks: item.remarks,
          qcSampleRequired: item.qcSampleRequired || false,
          qcSampleId: item.qcSampleRequired ? `QC-${Date.now()}` : undefined
        })),
        notes: grnData.notes,
        coaAttached: grnData.coaAttached || false,
        qcSampleRequested: items.some((item: any) => item.qcSampleRequired),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockGoodsReceipts.push(newGRN)

      const response: ProcurementApiResponse<GoodsReceipt> = {
        success: true,
        data: newGRN,
        message: "Goods receipt created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create goods receipt error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "warehouse_ops", "qc_manager"])(request, async (req, user) => {
    try {
      const grnData = await request.json()
      const { id, ...updateData } = grnData

      const grnIndex = mockGoodsReceipts.findIndex((grn) => grn.id === id)
      if (grnIndex === -1) {
        return Response.json({ success: false, error: "Goods receipt not found" }, { status: 404 })
      }

      // Update GRN
      mockGoodsReceipts[grnIndex] = {
        ...mockGoodsReceipts[grnIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: ProcurementApiResponse<GoodsReceipt> = {
        success: true,
        data: mockGoodsReceipts[grnIndex],
        message: "Goods receipt updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update goods receipt error:", error)
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
        return Response.json({ success: false, error: "Goods receipt ID is required" }, { status: 400 })
      }

      const grnIndex = mockGoodsReceipts.findIndex((grn) => grn.id === id)
      if (grnIndex === -1) {
        return Response.json({ success: false, error: "Goods receipt not found" }, { status: 404 })
      }

      const deletedGRN = mockGoodsReceipts.splice(grnIndex, 1)[0]

      const response: ProcurementApiResponse<GoodsReceipt> = {
        success: true,
        data: deletedGRN,
        message: "Goods receipt deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete goods receipt error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

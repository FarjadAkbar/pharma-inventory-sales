import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockBOMs } from "@/lib/manufacturing-mock-data"
import { validateText } from "@/lib/validations"
import type { BOM, BOMFilters, ManufacturingAPIResponse } from "@/types/manufacturing"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const drugId = searchParams.get("drugId")
      const status = searchParams.get("status")
      const version = searchParams.get("version")
      const createdBy = searchParams.get("createdBy")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredBOMs = [...mockBOMs]

      // Apply search filter
      if (search) {
        filteredBOMs = filteredBOMs.filter(
          (bom) =>
            bom.bomNumber.toLowerCase().includes(search.toLowerCase()) ||
            bom.drugName.toLowerCase().includes(search.toLowerCase()) ||
            bom.drugCode.toLowerCase().includes(search.toLowerCase()) ||
            bom.description.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (drugId) {
        filteredBOMs = filteredBOMs.filter((bom) => bom.drugId === drugId)
      }

      if (status) {
        filteredBOMs = filteredBOMs.filter((bom) => bom.status === status)
      }

      if (version) {
        const versionNum = Number.parseInt(version)
        filteredBOMs = filteredBOMs.filter((bom) => bom.version === versionNum)
      }

      if (createdBy) {
        filteredBOMs = filteredBOMs.filter((bom) => bom.createdBy === createdBy)
      }

      if (dateFrom) {
        filteredBOMs = filteredBOMs.filter((bom) => bom.createdAt >= dateFrom)
      }

      if (dateTo) {
        filteredBOMs = filteredBOMs.filter((bom) => bom.createdAt <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedBOMs = filteredBOMs.slice(startIndex, endIndex)

      const response: ManufacturingAPIResponse<{ boms: BOM[]; pagination: any }> = {
        success: true,
        data: {
          boms: paginatedBOMs,
          pagination: {
            page,
            limit,
            total: filteredBOMs.length,
            totalPages: Math.ceil(filteredBOMs.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get BOMs error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const bomData = await request.json()

      // Validation
      const { drugId, drugName, drugCode, description, items } = bomData

      if (!drugId || !drugName || !drugCode || !description || !items) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(drugName, 2, 100)) {
        return Response.json({ success: false, error: "Drug name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!validateText(description, 5, 500)) {
        return Response.json({ success: false, error: "Description must be between 5 and 500 characters" }, { status: 400 })
      }

      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({ success: false, error: "At least one BOM item is required" }, { status: 400 })
      }

      // Generate BOM number
      const bomNumber = `BOM-${String(mockBOMs.length + 1).padStart(3, '0')}`

      const newBOM: BOM = {
        id: (mockBOMs.length + 1).toString(),
        bomNumber,
        drugId,
        drugName,
        drugCode,
        version: 1,
        status: bomData.status || "Draft",
        description,
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          materialId: item.materialId,
          materialName: item.materialName,
          materialCode: item.materialCode,
          quantityPerBatch: Number(item.quantityPerBatch),
          unit: item.unit,
          tolerance: Number(item.tolerance) || 0,
          isCritical: item.isCritical || false,
          sequence: index + 1,
          remarks: item.remarks || ""
        })),
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        effectiveDate: bomData.effectiveDate,
        expiryDate: bomData.expiryDate,
        remarks: bomData.remarks
      }

      mockBOMs.push(newBOM)

      const response: ManufacturingAPIResponse<BOM> = {
        success: true,
        data: newBOM,
        message: "BOM created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create BOM error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const bomData = await request.json()
      const { id, ...updateData } = bomData

      const bomIndex = mockBOMs.findIndex((b) => b.id === id)
      if (bomIndex === -1) {
        return Response.json({ success: false, error: "BOM not found" }, { status: 404 })
      }

      // Update BOM
      mockBOMs[bomIndex] = {
        ...mockBOMs[bomIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: ManufacturingAPIResponse<BOM> = {
        success: true,
        data: mockBOMs[bomIndex],
        message: "BOM updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update BOM error:", error)
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
        return Response.json({ success: false, error: "BOM ID is required" }, { status: 400 })
      }

      const bomIndex = mockBOMs.findIndex((b) => b.id === id)
      if (bomIndex === -1) {
        return Response.json({ success: false, error: "BOM not found" }, { status: 404 })
      }

      const deletedBOM = mockBOMs.splice(bomIndex, 1)[0]

      const response: ManufacturingAPIResponse<BOM> = {
        success: true,
        data: deletedBOM,
        message: "BOM deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete BOM error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

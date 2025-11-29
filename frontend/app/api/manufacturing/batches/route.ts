import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockBatches } from "@/lib/manufacturing-mock-data"
import { validateText } from "@/lib/validations"
import type { Batch, BatchFilters, ManufacturingAPIResponse } from "@/types/manufacturing"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const drugId = searchParams.get("drugId")
      const siteId = searchParams.get("siteId")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const createdBy = searchParams.get("createdBy")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredBatches = [...mockBatches]

      // Apply search filter
      if (search) {
        filteredBatches = filteredBatches.filter(
          (batch) =>
            batch.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            batch.drugName.toLowerCase().includes(search.toLowerCase()) ||
            batch.drugCode.toLowerCase().includes(search.toLowerCase()) ||
            batch.workOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
            batch.siteName.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (drugId) {
        filteredBatches = filteredBatches.filter((batch) => batch.drugId === drugId)
      }

      if (siteId) {
        filteredBatches = filteredBatches.filter((batch) => batch.siteId === siteId)
      }

      if (status) {
        filteredBatches = filteredBatches.filter((batch) => batch.status === status)
      }

      if (priority) {
        filteredBatches = filteredBatches.filter((batch) => batch.priority === priority)
      }

      if (createdBy) {
        filteredBatches = filteredBatches.filter((batch) => batch.createdBy === createdBy)
      }

      if (dateFrom) {
        filteredBatches = filteredBatches.filter((batch) => batch.plannedStartDate >= dateFrom)
      }

      if (dateTo) {
        filteredBatches = filteredBatches.filter((batch) => batch.plannedStartDate <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedBatches = filteredBatches.slice(startIndex, endIndex)

      const response: ManufacturingAPIResponse<{ batches: Batch[]; pagination: any }> = {
        success: true,
        data: {
          batches: paginatedBatches,
          pagination: {
            page,
            limit,
            total: filteredBatches.length,
            totalPages: Math.ceil(filteredBatches.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get batches error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const batchData = await request.json()

      // Validation
      const { workOrderId, workOrderNumber, drugId, drugName, drugCode, siteId, siteName, plannedQuantity, unit, bomVersion } = batchData

      if (!workOrderId || !workOrderNumber || !drugId || !drugName || !drugCode || !siteId || !siteName || !plannedQuantity || !unit || !bomVersion) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(drugName, 2, 100)) {
        return Response.json({ success: false, error: "Drug name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (plannedQuantity <= 0) {
        return Response.json({ success: false, error: "Planned quantity must be greater than 0" }, { status: 400 })
      }

      // Generate batch number
      const year = new Date().getFullYear()
      const batchNumber = `BATCH-${String(mockBatches.length + 1).padStart(3, '0')}-${year}`

      const newBatch: Batch = {
        id: (mockBatches.length + 1).toString(),
        batchNumber,
        workOrderId,
        workOrderNumber,
        drugId,
        drugName,
        drugCode,
        siteId,
        siteName,
        plannedQuantity: Number(plannedQuantity),
        actualQuantity: batchData.actualQuantity ? Number(batchData.actualQuantity) : undefined,
        unit,
        bomVersion: Number(bomVersion),
        status: batchData.status || "Planned",
        priority: batchData.priority || "Normal",
        plannedStartDate: batchData.plannedStartDate,
        plannedEndDate: batchData.plannedEndDate,
        actualStartDate: batchData.actualStartDate,
        actualEndDate: batchData.actualEndDate,
        startedBy: batchData.startedBy,
        startedByName: batchData.startedByName,
        startedAt: batchData.startedAt,
        completedBy: batchData.completedBy,
        completedByName: batchData.completedByName,
        completedAt: batchData.completedAt,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        remarks: batchData.remarks
      }

      mockBatches.push(newBatch)

      const response: ManufacturingAPIResponse<Batch> = {
        success: true,
        data: newBatch,
        message: "Batch created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create batch error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const batchData = await request.json()
      const { id, ...updateData } = batchData

      const batchIndex = mockBatches.findIndex((b) => b.id === id)
      if (batchIndex === -1) {
        return Response.json({ success: false, error: "Batch not found" }, { status: 404 })
      }

      // Update batch
      mockBatches[batchIndex] = {
        ...mockBatches[batchIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: ManufacturingAPIResponse<Batch> = {
        success: true,
        data: mockBatches[batchIndex],
        message: "Batch updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update batch error:", error)
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
        return Response.json({ success: false, error: "Batch ID is required" }, { status: 400 })
      }

      const batchIndex = mockBatches.findIndex((b) => b.id === id)
      if (batchIndex === -1) {
        return Response.json({ success: false, error: "Batch not found" }, { status: 404 })
      }

      const deletedBatch = mockBatches.splice(batchIndex, 1)[0]

      const response: ManufacturingAPIResponse<Batch> = {
        success: true,
        data: deletedBatch,
        message: "Batch deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete batch error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

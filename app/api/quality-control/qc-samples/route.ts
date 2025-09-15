import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQCSamples } from "@/lib/qc-mock-data"
import { validateText } from "@/lib/validations"
import type { QCSample, QCSampleFilters, QCAPIResponse } from "@/types/quality-control"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qc_manager", "qa_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const sourceType = searchParams.get("sourceType")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const assignedTo = searchParams.get("assignedTo")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredSamples = [...mockQCSamples]

      // Apply search filter
      if (search) {
        filteredSamples = filteredSamples.filter(
          (sample) =>
            sample.sampleNumber.toLowerCase().includes(search.toLowerCase()) ||
            sample.materialName.toLowerCase().includes(search.toLowerCase()) ||
            sample.materialCode.toLowerCase().includes(search.toLowerCase()) ||
            sample.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            sample.sourceReference.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (sourceType) {
        filteredSamples = filteredSamples.filter((sample) => sample.sourceType === sourceType)
      }

      if (status) {
        filteredSamples = filteredSamples.filter((sample) => sample.status === status)
      }

      if (priority) {
        filteredSamples = filteredSamples.filter((sample) => sample.priority === priority)
      }

      if (assignedTo) {
        filteredSamples = filteredSamples.filter((sample) => sample.assignedTo === assignedTo)
      }

      if (dateFrom) {
        filteredSamples = filteredSamples.filter((sample) => sample.requestedAt >= dateFrom)
      }

      if (dateTo) {
        filteredSamples = filteredSamples.filter((sample) => sample.requestedAt <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedSamples = filteredSamples.slice(startIndex, endIndex)

      const response: QCAPIResponse<{ qcSamples: QCSample[]; pagination: any }> = {
        success: true,
        data: {
          qcSamples: paginatedSamples,
          pagination: {
            page,
            limit,
            total: filteredSamples.length,
            totalPages: Math.ceil(filteredSamples.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get QC samples error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qc_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const sampleData = await request.json()

      // Validation
      const { sourceType, sourceId, sourceReference, materialId, materialName, materialCode, batchNumber, quantity, unit, tests } = sampleData

      if (!sourceType || !sourceId || !sourceReference || !materialId || !materialName || !materialCode || !batchNumber || !quantity || !unit || !tests) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      // Generate sample number
      const sampleNumber = `QC-SAM-${new Date().getFullYear()}-${String(mockQCSamples.length + 1).padStart(3, '0')}`

      const newSample: QCSample = {
        id: (mockQCSamples.length + 1).toString(),
        sampleNumber,
        sourceType,
        sourceId,
        sourceReference,
        materialId,
        materialName,
        materialCode,
        batchNumber,
        quantity: Number(quantity),
        unit,
        priority: sampleData.priority || "Normal",
        status: "Pending",
        requestedBy: user.userId.toString(),
        requestedByName: user.name || "Unknown User",
        requestedAt: new Date().toISOString(),
        dueDate: sampleData.dueDate,
        tests: tests.map((test: any) => ({
          id: (Date.now() + Math.random()).toString(),
          testId: test.testId,
          testName: test.testName,
          testCode: test.testCode,
          status: "Pending"
        })),
        remarks: sampleData.remarks
      }

      mockQCSamples.push(newSample)

      const response: QCAPIResponse<QCSample> = {
        success: true,
        data: newSample,
        message: "QC sample created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create QC sample error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qc_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const sampleData = await request.json()
      const { id, ...updateData } = sampleData

      const sampleIndex = mockQCSamples.findIndex((s) => s.id === id)
      if (sampleIndex === -1) {
        return Response.json({ success: false, error: "QC sample not found" }, { status: 404 })
      }

      // Update sample
      mockQCSamples[sampleIndex] = {
        ...mockQCSamples[sampleIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: QCAPIResponse<QCSample> = {
        success: true,
        data: mockQCSamples[sampleIndex],
        message: "QC sample updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update QC sample error:", error)
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
        return Response.json({ success: false, error: "QC sample ID is required" }, { status: 400 })
      }

      const sampleIndex = mockQCSamples.findIndex((s) => s.id === id)
      if (sampleIndex === -1) {
        return Response.json({ success: false, error: "QC sample not found" }, { status: 404 })
      }

      const deletedSample = mockQCSamples.splice(sampleIndex, 1)[0]

      const response: QCAPIResponse<QCSample> = {
        success: true,
        data: deletedSample,
        message: "QC sample deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete QC sample error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

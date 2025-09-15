import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQADeviations } from "@/lib/qa-mock-data"
import { validateText } from "@/lib/validations"
import type { QADeviation, QADeviationFilters, QAAPIResponse } from "@/types/quality-assurance"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const severity = searchParams.get("severity")
      const category = searchParams.get("category")
      const status = searchParams.get("status")
      const assignedTo = searchParams.get("assignedTo")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredDeviations = [...mockQADeviations]

      // Apply search filter
      if (search) {
        filteredDeviations = filteredDeviations.filter(
          (deviation) =>
            deviation.deviationNumber.toLowerCase().includes(search.toLowerCase()) ||
            deviation.title.toLowerCase().includes(search.toLowerCase()) ||
            deviation.description.toLowerCase().includes(search.toLowerCase()) ||
            deviation.materialName?.toLowerCase().includes(search.toLowerCase()) ||
            deviation.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
            deviation.sourceReference.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (severity) {
        filteredDeviations = filteredDeviations.filter((deviation) => deviation.severity === severity)
      }

      if (category) {
        filteredDeviations = filteredDeviations.filter((deviation) => deviation.category === category)
      }

      if (status) {
        filteredDeviations = filteredDeviations.filter((deviation) => deviation.status === status)
      }

      if (assignedTo) {
        filteredDeviations = filteredDeviations.filter((deviation) => deviation.assignedTo === assignedTo)
      }

      if (dateFrom) {
        filteredDeviations = filteredDeviations.filter((deviation) => deviation.discoveredAt >= dateFrom)
      }

      if (dateTo) {
        filteredDeviations = filteredDeviations.filter((deviation) => deviation.discoveredAt <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedDeviations = filteredDeviations.slice(startIndex, endIndex)

      const response: QAAPIResponse<{ deviations: QADeviation[]; pagination: any }> = {
        success: true,
        data: {
          deviations: paginatedDeviations,
          pagination: {
            page,
            limit,
            total: filteredDeviations.length,
            totalPages: Math.ceil(filteredDeviations.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get QA deviations error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const deviationData = await request.json()

      // Validation
      const { title, description, severity, category, sourceType, sourceId, sourceReference } = deviationData

      if (!title || !description || !severity || !category || !sourceType || !sourceId || !sourceReference) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(title, 5, 200)) {
        return Response.json({ success: false, error: "Title must be between 5 and 200 characters" }, { status: 400 })
      }

      // Generate deviation number
      const deviationNumber = `DEV-${String(mockQADeviations.length + 1).padStart(3, '0')}`

      const newDeviation: QADeviation = {
        id: (mockQADeviations.length + 1).toString(),
        deviationNumber,
        title,
        description,
        severity,
        category,
        status: "Open",
        sourceType,
        sourceId,
        sourceReference,
        materialId: deviationData.materialId,
        materialName: deviationData.materialName,
        batchNumber: deviationData.batchNumber,
        discoveredBy: user.userId.toString(),
        discoveredByName: user.name || "Unknown User",
        discoveredAt: new Date().toISOString(),
        assignedTo: deviationData.assignedTo,
        assignedToName: deviationData.assignedToName,
        assignedAt: deviationData.assignedTo ? new Date().toISOString() : undefined,
        dueDate: deviationData.dueDate,
        rootCause: deviationData.rootCause,
        immediateAction: deviationData.immediateAction,
        correctiveAction: deviationData.correctiveAction,
        preventiveAction: deviationData.preventiveAction,
        effectivenessCheck: deviationData.effectivenessCheck,
        attachments: [],
        timeline: [
          {
            id: "1",
            event: "Deviation Opened",
            description: "Deviation opened for investigation",
            performedBy: user.userId.toString(),
            performedByName: user.name || "Unknown User",
            performedAt: new Date().toISOString(),
            status: "Completed"
          }
        ]
      }

      mockQADeviations.push(newDeviation)

      const response: QAAPIResponse<QADeviation> = {
        success: true,
        data: newDeviation,
        message: "QA deviation created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create QA deviation error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qa_manager"])(request, async (req, user) => {
    try {
      const deviationData = await request.json()
      const { id, ...updateData } = deviationData

      const deviationIndex = mockQADeviations.findIndex((d) => d.id === id)
      if (deviationIndex === -1) {
        return Response.json({ success: false, error: "QA deviation not found" }, { status: 404 })
      }

      // Update deviation
      mockQADeviations[deviationIndex] = {
        ...mockQADeviations[deviationIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: QAAPIResponse<QADeviation> = {
        success: true,
        data: mockQADeviations[deviationIndex],
        message: "QA deviation updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update QA deviation error:", error)
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
        return Response.json({ success: false, error: "QA deviation ID is required" }, { status: 400 })
      }

      const deviationIndex = mockQADeviations.findIndex((d) => d.id === id)
      if (deviationIndex === -1) {
        return Response.json({ success: false, error: "QA deviation not found" }, { status: 404 })
      }

      const deletedDeviation = mockQADeviations.splice(deviationIndex, 1)[0]

      const response: QAAPIResponse<QADeviation> = {
        success: true,
        data: deletedDeviation,
        message: "QA deviation deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete QA deviation error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

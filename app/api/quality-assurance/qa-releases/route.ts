import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQAReleases } from "@/lib/qa-mock-data"
import { validateText } from "@/lib/validations"
import type { QARelease, QAReleaseFilters, QAAPIResponse } from "@/types/quality-assurance"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const entityType = searchParams.get("entityType")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const reviewedBy = searchParams.get("reviewedBy")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredReleases = [...mockQAReleases]

      // Apply search filter
      if (search) {
        filteredReleases = filteredReleases.filter(
          (release) =>
            release.releaseNumber.toLowerCase().includes(search.toLowerCase()) ||
            release.materialName.toLowerCase().includes(search.toLowerCase()) ||
            release.materialCode.toLowerCase().includes(search.toLowerCase()) ||
            release.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            release.entityReference.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (entityType) {
        filteredReleases = filteredReleases.filter((release) => release.entityType === entityType)
      }

      if (status) {
        filteredReleases = filteredReleases.filter((release) => release.status === status)
      }

      if (priority) {
        filteredReleases = filteredReleases.filter((release) => release.priority === priority)
      }

      if (reviewedBy) {
        filteredReleases = filteredReleases.filter((release) => release.reviewedBy === reviewedBy)
      }

      if (dateFrom) {
        filteredReleases = filteredReleases.filter((release) => release.submittedAt >= dateFrom)
      }

      if (dateTo) {
        filteredReleases = filteredReleases.filter((release) => release.submittedAt <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedReleases = filteredReleases.slice(startIndex, endIndex)

      const response: QAAPIResponse<{ qaReleases: QARelease[]; pagination: any }> = {
        success: true,
        data: {
          qaReleases: paginatedReleases,
          pagination: {
            page,
            limit,
            total: filteredReleases.length,
            totalPages: Math.ceil(filteredReleases.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get QA releases error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const releaseData = await request.json()

      // Validation
      const { entityType, entityId, entityReference, materialId, materialName, materialCode, batchNumber, quantity, unit, qcResults, checklistItems } = releaseData

      if (!entityType || !entityId || !entityReference || !materialId || !materialName || !materialCode || !batchNumber || !quantity || !unit || !qcResults || !checklistItems) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      // Generate release number
      const releaseNumber = `QA-REL-${String(mockQAReleases.length + 1).padStart(3, '0')}`

      const newRelease: QARelease = {
        id: (mockQAReleases.length + 1).toString(),
        releaseNumber,
        entityType,
        entityId,
        entityReference,
        materialId,
        materialName,
        materialCode,
        batchNumber,
        quantity: Number(quantity),
        unit,
        sourceType: releaseData.sourceType || "GRN",
        sourceId: releaseData.sourceId || entityId,
        sourceReference: releaseData.sourceReference || entityReference,
        status: "Pending",
        priority: releaseData.priority || "Normal",
        qcResults: qcResults.map((result: any) => ({
          id: (Date.now() + Math.random()).toString(),
          testId: result.testId,
          testName: result.testName,
          testCode: result.testCode,
          parameter: result.parameter,
          resultValue: result.resultValue,
          unit: result.unit,
          specification: result.specification,
          passed: result.passed,
          deviation: result.deviation,
          testedBy: result.testedBy,
          testedByName: result.testedByName,
          testedAt: result.testedAt,
          reviewedBy: result.reviewedBy,
          reviewedByName: result.reviewedByName,
          reviewedAt: result.reviewedAt
        })),
        decision: "Pending",
        checklistItems: checklistItems.map((item: any) => ({
          id: (Date.now() + Math.random()).toString(),
          item: item.item,
          description: item.description,
          category: item.category,
          checked: false,
          isRequired: item.isRequired !== false
        })),
        submittedBy: user.userId.toString(),
        submittedByName: user.name || "Unknown User",
        submittedAt: new Date().toISOString(),
        dueDate: releaseData.dueDate,
        remarks: releaseData.remarks
      }

      mockQAReleases.push(newRelease)

      const response: QAAPIResponse<QARelease> = {
        success: true,
        data: newRelease,
        message: "QA release created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create QA release error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qa_manager"])(request, async (req, user) => {
    try {
      const releaseData = await request.json()
      const { id, ...updateData } = releaseData

      const releaseIndex = mockQAReleases.findIndex((r) => r.id === id)
      if (releaseIndex === -1) {
        return Response.json({ success: false, error: "QA release not found" }, { status: 404 })
      }

      // Update release
      mockQAReleases[releaseIndex] = {
        ...mockQAReleases[releaseIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: QAAPIResponse<QARelease> = {
        success: true,
        data: mockQAReleases[releaseIndex],
        message: "QA release updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update QA release error:", error)
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
        return Response.json({ success: false, error: "QA release ID is required" }, { status: 400 })
      }

      const releaseIndex = mockQAReleases.findIndex((r) => r.id === id)
      if (releaseIndex === -1) {
        return Response.json({ success: false, error: "QA release not found" }, { status: 404 })
      }

      const deletedRelease = mockQAReleases.splice(releaseIndex, 1)[0]

      const response: QAAPIResponse<QARelease> = {
        success: true,
        data: deletedRelease,
        message: "QA release deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete QA release error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

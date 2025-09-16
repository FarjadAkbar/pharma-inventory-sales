import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQAReleases } from "@/lib/qa-mock-data"
import type { QARelease, QAAPIResponse } from "@/types/quality-assurance"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(["system_admin", "org_admin", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const release = mockQAReleases.find((r) => r.id === params.id)

      if (!release) {
        return Response.json({ success: false, error: "QA release not found" }, { status: 404 })
      }

      const response: QAAPIResponse<QARelease> = {
        success: true,
        data: release,
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get QA release error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(["system_admin", "org_admin", "qa_manager"])(request, async (req, user) => {
    try {
      const releaseData = await request.json()

      const releaseIndex = mockQAReleases.findIndex((r) => r.id === params.id)
      if (releaseIndex === -1) {
        return Response.json({ success: false, error: "QA release not found" }, { status: 404 })
      }

      // Update release
      mockQAReleases[releaseIndex] = {
        ...mockQAReleases[releaseIndex],
        ...releaseData,
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

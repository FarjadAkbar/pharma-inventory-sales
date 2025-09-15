import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQCSamples } from "@/lib/qc-mock-data"
import type { QCSample, QCAPIResponse } from "@/types/quality-control"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(["system_admin", "org_admin", "qc_manager", "qa_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const sample = mockQCSamples.find((s) => s.id === params.id)

      if (!sample) {
        return Response.json({ success: false, error: "QC sample not found" }, { status: 404 })
      }

      const response: QCAPIResponse<QCSample> = {
        success: true,
        data: sample,
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get QC sample error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(["system_admin", "org_admin", "qc_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const sampleData = await request.json()

      const sampleIndex = mockQCSamples.findIndex((s) => s.id === params.id)
      if (sampleIndex === -1) {
        return Response.json({ success: false, error: "QC sample not found" }, { status: 404 })
      }

      // Update sample
      mockQCSamples[sampleIndex] = {
        ...mockQCSamples[sampleIndex],
        ...sampleData,
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

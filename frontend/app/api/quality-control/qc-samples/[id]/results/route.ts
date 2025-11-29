import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQCSamples, mockQCTestResults } from "@/lib/qc-mock-data"
import type { QCTestResult, QCAPIResponse } from "@/types/quality-control"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(["system_admin", "org_admin", "qc_manager"])(request, async (req, user) => {
    try {
      const resultsData = await request.json()
      const { testResults, status, completedAt } = resultsData

      const sampleIndex = mockQCSamples.findIndex((s) => s.id === params.id)
      if (sampleIndex === -1) {
        return Response.json({ success: false, error: "QC sample not found" }, { status: 404 })
      }

      // Update sample with results
      mockQCSamples[sampleIndex] = {
        ...mockQCSamples[sampleIndex],
        status: status || "Completed",
        completedAt: completedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add test results to mock data
      if (testResults && Array.isArray(testResults)) {
        testResults.forEach((result: QCTestResult) => {
          const existingIndex = mockQCTestResults.findIndex(r => r.id === result.id)
          if (existingIndex >= 0) {
            mockQCTestResults[existingIndex] = result
          } else {
            mockQCTestResults.push(result)
          }
        })
      }

      const response: QCAPIResponse<{ sample: any; results: QCTestResult[] }> = {
        success: true,
        data: {
          sample: mockQCSamples[sampleIndex],
          results: testResults || []
        },
        message: "QC test results saved successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update QC sample results error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockAuditTrails } from "@/lib/reporting-mock-data"
import type { AuditTrail, AuditFilters, ReportingAPIResponse } from "@/types/reporting"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const userId = searchParams.get("userId")
      const action = searchParams.get("action")
      const entityType = searchParams.get("entityType")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredTrails = [...mockAuditTrails]

      // Apply search filter
      if (search) {
        filteredTrails = filteredTrails.filter(
          (trail) =>
            trail.userName.toLowerCase().includes(search.toLowerCase()) ||
            trail.action.toLowerCase().includes(search.toLowerCase()) ||
            trail.entityType.toLowerCase().includes(search.toLowerCase()) ||
            trail.entityName.toLowerCase().includes(search.toLowerCase()) ||
            trail.ipAddress.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (userId) {
        filteredTrails = filteredTrails.filter((trail) => trail.userId === userId)
      }

      if (action) {
        filteredTrails = filteredTrails.filter((trail) => trail.action === action)
      }

      if (entityType) {
        filteredTrails = filteredTrails.filter((trail) => trail.entityType === entityType)
      }

      if (dateFrom) {
        filteredTrails = filteredTrails.filter((trail) => trail.timestamp >= dateFrom)
      }

      if (dateTo) {
        filteredTrails = filteredTrails.filter((trail) => trail.timestamp <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedTrails = filteredTrails.slice(startIndex, endIndex)

      const response: ReportingAPIResponse<{ auditTrails: AuditTrail[]; pagination: any }> = {
        success: true,
        data: {
          auditTrails: paginatedTrails,
          pagination: {
            page,
            limit,
            total: filteredTrails.length,
            totalPages: Math.ceil(filteredTrails.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get audit trails error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

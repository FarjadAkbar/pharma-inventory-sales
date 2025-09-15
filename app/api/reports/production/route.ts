import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockProductionDashboard } from "@/lib/reporting-mock-data"
import type { ProductionDashboard, ReportingAPIResponse } from "@/types/reporting"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const period = searchParams.get("period") || "2024-01"

      // In a real application, you would fetch data based on the period
      // For now, we return the mock data
      const dashboard: ProductionDashboard = {
        ...mockProductionDashboard,
        period
      }

      const response: ReportingAPIResponse<ProductionDashboard> = {
        success: true,
        data: dashboard,
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get production dashboard error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

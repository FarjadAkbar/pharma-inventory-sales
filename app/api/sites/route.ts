import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockSites } from "@/lib/procurement-mock-data"
import type { Site, ProcurementApiResponse } from "@/types/procurement"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const response: ProcurementApiResponse<{ sites: Site[] }> = {
        success: true,
        data: {
          sites: mockSites.filter(site => site.isActive)
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get sites error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

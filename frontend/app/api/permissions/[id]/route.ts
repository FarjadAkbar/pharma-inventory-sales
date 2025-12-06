import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(["admin", "client_admin"])(request, async (req, user) => {
    try {
      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      // Call backend API Gateway
      const response = await fetch(`${API_GATEWAY_URL}/permissions/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return Response.json(
          { success: false, error: data.message || 'Failed to fetch permission' },
          { status: response.status }
        )
      }

      return Response.json({
        success: true,
        data: data,
      })
    } catch (error) {
      console.error("Get permission error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

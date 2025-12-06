import type { NextRequest } from "next/server"
import { authenticateRequest, createAuthResponse } from "@/lib/auth-middleware"

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return createAuthResponse("Authentication required")
    }

    // Call backend API Gateway to get current user
    try {
      const response = await fetch(`${API_GATEWAY_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return createAuthResponse("Invalid token")
      }

      const user = await response.json()
      return Response.json({ success: true, data: user })
    } catch (error) {
      // Fallback to JWT decode if backend call fails
      const user = await authenticateRequest(request)
      if (!user) {
        return createAuthResponse("Authentication required")
      }
      return Response.json({ success: true, data: user })
    }
  } catch (error) {
    console.error("Get user error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

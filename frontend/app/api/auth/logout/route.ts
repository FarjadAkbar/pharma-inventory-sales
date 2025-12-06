import type { NextRequest } from "next/server"

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    // Call backend API Gateway to logout
    if (token) {
      try {
        await fetch(`${API_GATEWAY_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error("Backend logout request failed:", error)
        // Continue with logout even if backend call fails
      }
    }

    return Response.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

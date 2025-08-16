import type { NextRequest } from "next/server"
import { authenticateRequest, createAuthResponse } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return createAuthResponse("Authentication required")
    }

    return Response.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

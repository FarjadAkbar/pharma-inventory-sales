import type { NextRequest } from "next/server"

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return Response.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Call backend API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json(
        { success: false, error: data.message || 'Login failed' },
        { status: response.status }
      )
    }

    // Backend returns { accessToken, refreshToken }
    // Return in format expected by authService.rawRequest
    return Response.json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

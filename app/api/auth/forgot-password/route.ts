import type { NextRequest } from "next/server"
import { mockUsers } from "@/lib/mock-data"
import { validateEmail } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Check if user exists (but don't reveal if they don't for security)
    const user = mockUsers.find((u) => u.email === email)

    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Store it with expiration
    // 3. Send email with reset link

    // For now, we'll just simulate success
    console.log(`Password reset requested for: ${email}`)

    return Response.json({
      success: true,
      message: "If an account with that email exists, you'll receive a password reset link shortly.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

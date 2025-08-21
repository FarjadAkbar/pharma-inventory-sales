import type { NextRequest } from "next/server"
import { authenticateRequest, createAuthResponse } from "@/lib/auth-middleware"
import { mockPasswords } from "@/lib/mock-data"
import { validatePassword } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return createAuthResponse("Authentication required")
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return Response.json({ success: false, error: "Current password and new password are required" }, { status: 400 })
    }

    if (!validatePassword(newPassword)) {
      return Response.json(
        { success: false, error: "New password must be at least 8 characters with uppercase, lowercase, and number" },
        { status: 400 },
      )
    }

    // Check current password
    const storedPassword = mockPasswords[user.email]
    if (storedPassword !== currentPassword) {
      return Response.json({ success: false, error: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    mockPasswords[user.email] = newPassword

    return Response.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

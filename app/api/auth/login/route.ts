import type { NextRequest } from "next/server"
import { signToken } from "@/lib/jwt"
import { mockUsers, mockPasswords } from "@/lib/mock-data"
import { validateEmail } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return Response.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Find user
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const storedPassword = mockPasswords[email]
    if (storedPassword !== password) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedStores: user.assignedStores,
      defaultStoreId: (user as any).defaultStoreId,
      screenPermissions: (user as any).screenPermissions || [],
    })

    return Response.json({ success: true, data: { user, token } })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

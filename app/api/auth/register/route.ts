import type { NextRequest } from "next/server"
import { signToken } from "@/lib/jwt"
import { mockUsers } from "@/lib/mock-data"
import { validateEmail, validatePassword, validateText } from "@/lib/validations"
import type { User } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "user" } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return Response.json({ success: false, error: "Name, email, and password are required" }, { status: 400 })
    }

    if (!validateText(name, 2, 50)) {
      return Response.json({ success: false, error: "Name must be between 2 and 50 characters" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    if (!validatePassword(password)) {
      return Response.json(
        { success: false, error: "Password must be at least 8 characters with uppercase, lowercase, and number" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return Response.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      role: role as "admin" | "manager" | "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    // Generate JWT token
    const token = await signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })

    return Response.json({
      success: true,
      data: {
        user: newUser,
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

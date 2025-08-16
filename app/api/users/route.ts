import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockUsers } from "@/lib/mock-data"
import { validateEmail, validateText } from "@/lib/validations"
import type { User } from "@/types/auth"

export async function GET(request: NextRequest) {
  return requireAuth(["admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const role = searchParams.get("role")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredUsers = [...mockUsers]

      // Apply search filter
      if (search) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Apply role filter
      if (role) {
        filteredUsers = filteredUsers.filter((user) => user.role === role)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

      return Response.json({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            page,
            limit,
            total: filteredUsers.length,
            pages: Math.ceil(filteredUsers.length / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get users error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["admin"])(request, async (req, user) => {
    try {
      const userData = await request.json()

      // Validation
      const { name, email, role = "user" } = userData

      if (!name || !email) {
        return Response.json({ success: false, error: "Name and email are required" }, { status: 400 })
      }

      if (!validateText(name, 2, 50)) {
        return Response.json({ success: false, error: "Name must be between 2 and 50 characters" }, { status: 400 })
      }

      if (!validateEmail(email)) {
        return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
      }

      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === email)
      if (existingUser) {
        return Response.json({ success: false, error: "User with this email already exists" }, { status: 409 })
      }

      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        name,
        email,
        role: role as "admin" | "manager" | "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockUsers.push(newUser)

      return Response.json({
        success: true,
        data: newUser,
      })
    } catch (error) {
      console.error("Create user error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

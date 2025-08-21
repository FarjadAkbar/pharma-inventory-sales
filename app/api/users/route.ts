import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockUsers } from "@/lib/mock-data"
import { validateEmail, validateText } from "@/lib/validations"
import type { User } from "@/types/auth"

export async function GET(request: NextRequest) {
  return requireAuth(["admin", "store_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const role = searchParams.get("role")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredUsers = [...mockUsers]

      // Store manager can only see users within their assigned stores and cannot see admins
      if (user.role === "store_manager") {
        const managerStores = (user as any).assignedStores || []
        filteredUsers = filteredUsers.filter((u) => {
          if (u.role === "admin") return false
          const userStores = (u as any).assignedStores || []
          return userStores.some((sid: string) => managerStores.includes(sid))
        })
      }

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
  return requireAuth(["admin", "store_manager"])(request, async (req, user) => {
    try {
      const userData = await request.json()

      // Validation
      const { name, email, role = "employee", assignedStores = [], screenPermissions = [] } = userData

      if (!name || !email) {
        return Response.json({ success: false, error: "Name and email are required" }, { status: 400 })
      }

      if (!validateText(name, 2, 50)) {
        return Response.json({ success: false, error: "Name must be between 2 and 50 characters" }, { status: 400 })
      }

      if (!validateEmail(email)) {
        return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
      }

      // Store manager can only create employees for their stores
      if (user.role === "store_manager") {
        if (role !== "employee") {
          return Response.json({ success: false, error: "Only employees can be created by store managers" }, { status: 403 })
        }
        const managerStores = (user as any).assignedStores || []
        const invalid = assignedStores.some((sid: string) => !managerStores.includes(sid))
        if (invalid || assignedStores.length === 0) {
          return Response.json({ success: false, error: "Assigned stores must be within your stores" }, { status: 400 })
        }
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
        role: role as any,
        assignedStores,
        screenPermissions,
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

export async function PUT(request: NextRequest) {
  return requireAuth(["admin", "store_manager"])(request, async (req, user) => {
    try {
      const body = await request.json()
      const { id, name, email, role, assignedStores = [], screenPermissions = [] } = body || {}
      const idx = mockUsers.findIndex((u) => u.id === id)
      if (idx === -1) return Response.json({ success: false, error: "User not found" }, { status: 404 })

      // Store manager constraints
      if (user.role === "store_manager") {
        const managerStores = (user as any).assignedStores || []
        const target = mockUsers[idx]
        if (target.role === "admin" || target.role === "store_manager") {
          return Response.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
        }
        const invalid = assignedStores.some((sid: string) => !managerStores.includes(sid))
        if (invalid) return Response.json({ success: false, error: "Assigned stores must be within your stores" }, { status: 400 })
      }

      const existing = mockUsers[idx]
      mockUsers[idx] = {
        ...existing,
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(role ? { role } : {}),
        assignedStores,
        screenPermissions,
        updatedAt: new Date().toISOString(),
      } as any

      return Response.json({ success: true, data: mockUsers[idx] })
    } catch (error) {
      console.error("Update user error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(["admin", "store_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")
      if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 })
      const idx = mockUsers.findIndex((u) => u.id === id)
      if (idx === -1) return Response.json({ success: false, error: "User not found" }, { status: 404 })

      const target = mockUsers[idx]
      if (user.role === "store_manager") {
        const managerStores = (user as any).assignedStores || []
        const userStores = (target as any).assignedStores || []
        if (target.role === "admin" || target.role === "store_manager") {
          return Response.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
        }
        const overlap = userStores.some((sid: string) => managerStores.includes(sid))
        if (!overlap) return Response.json({ success: false, error: "User not in your stores" }, { status: 403 })
      }

      const removed = mockUsers.splice(idx, 1)[0]
      return Response.json({ success: true, data: removed })
    } catch (error) {
      console.error("Delete user error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

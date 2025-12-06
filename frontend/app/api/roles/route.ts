import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'

export async function GET(request: NextRequest) {
  return requireAuth(["admin", "client_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const page = searchParams.get("page") || "1"
      const limit = searchParams.get("limit") || "10"

      // Build query string
      const queryParams = new URLSearchParams()
      if (search) queryParams.set("search", search)
      queryParams.set("page", page)
      queryParams.set("limit", limit)

      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      // Call backend API Gateway
      const response = await fetch(`${API_GATEWAY_URL}/roles?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return Response.json(
          { success: false, error: data.message || 'Failed to fetch roles' },
          { status: response.status }
        )
      }

      // Backend returns paginated response
      return Response.json({
        success: true,
        data: {
          roles: data.docs || [],
          pagination: {
            page: data.page || parseInt(page),
            limit: data.limit || parseInt(limit),
            total: data.total || 0,
            pages: Math.ceil((data.total || 0) / (data.limit || parseInt(limit))),
          },
        },
      })
    } catch (error) {
      console.error("Get roles error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["admin", "client_admin"])(request, async (req, user) => {
    try {
      const roleData = await request.json()
      const { name } = roleData

      // Validation
      if (!name) {
        return Response.json(
          { success: false, error: "Role name is required" },
          { status: 400 }
        )
      }

      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      // Call backend API Gateway
      const response = await fetch(`${API_GATEWAY_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return Response.json(
          { success: false, error: data.message || 'Failed to create role' },
          { status: response.status }
        )
      }

      return Response.json({
        success: true,
        data: data,
      })
    } catch (error) {
      console.error("Create role error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["admin", "client_admin"])(request, async (req, user) => {
    try {
      const body = await request.json()
      const { id, name } = body

      if (!id) {
        return Response.json({ success: false, error: "id is required" }, { status: 400 })
      }

      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      // Call backend API Gateway
      const response = await fetch(`${API_GATEWAY_URL}/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return Response.json(
          { success: false, error: data.message || 'Failed to update role' },
          { status: response.status }
        )
      }

      return Response.json({ success: true, data })
    } catch (error) {
      console.error("Update role error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(["admin", "client_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")
      if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 })

      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      // Call backend API Gateway
      const response = await fetch(`${API_GATEWAY_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return Response.json(
          { success: false, error: data.message || 'Failed to delete role' },
          { status: response.status }
        )
      }

      return Response.json({ success: true, data })
    } catch (error) {
      console.error("Delete role error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

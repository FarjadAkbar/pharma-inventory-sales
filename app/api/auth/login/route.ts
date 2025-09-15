import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { mockUsers, mockPasswords } from "@/lib/mock-data"

// Use the same secret as the JWT library
const JWT_SECRET = 'pharma-inventory-sales-jwt-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe, organization } = await request.json()

    // Validation
    if (!email || !password || !organization) {
      return Response.json({ success: false, error: "Email, password, and organization are required" }, { status: 400 })
    }

    // Find user by email
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const storedPassword = mockPasswords[email]
    if (storedPassword !== password) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token with new structure
    const tokenPayload = {
      userId: parseInt(user.id),
      clientId: 1, // Mock client ID
      storeId: parseInt(organization), // Use organization as storeId
      role: user.role,
      email: user.email,
      name: user.name,
      organization: organization,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 60 * 60), // 30 days if rememberMe, 1 hour otherwise
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET)

    // Return mock permissions based on role
    let permissions = {}
    if (user.role === "pos_staff") {
      permissions = {
        POS: {
          product: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          category: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: false,
            canAll: false
          }
        }
      }
    } else if (user.role === "client_admin") {
      permissions = {
        POS: {
          product: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          category: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          vendor: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          store: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          sale: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          }
        },
        PHARMA: {
          product: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          category: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          vendor: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          store: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          },
          sale: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          }
        },
        USER_MANAGEMENT: {
          users: {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAll: true
          }
        }
      }
    }

    return Response.json({ 
      success: true, 
      token,
      permissions
    })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

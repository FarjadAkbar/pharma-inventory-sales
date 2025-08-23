import type { NextRequest } from "next/server"
import { extractUserFromToken, isTokenValid } from "./jwt"
import type { User, JwtPayload } from "@/types/auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: User
}

export async function authenticateRequest(request: NextRequest): Promise<User | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization")
    let token = null
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else {
      // Check cookie
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").map((c) => c.trim())
        const tokenCookie = cookies.find((c) => c.startsWith("pharma_inventory_sales_token="))
        if (tokenCookie) {
          token = tokenCookie.split("=")[1]
        }
      }
    }

    if (!token) {
      return null
    }

    if (!isTokenValid(token)) {
      return null
    }

    const payload = extractUserFromToken(token)
    if (!payload) {
      return null
    }

    // Convert JWT payload to User object
    const user: User = {
      id: payload.userId.toString(),
      email: "user@example.com", // This would come from the database in real app
      name: "User Name",
      role: payload.role,
      clientId: payload.clientId,
      storeId: payload.storeId,
      permissions: {}, // This would come from the database in real app
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return user
  } catch (error) {
    console.error("Authentication failed:", error)
    return null
  }
}

export function createAuthResponse(message: string, status = 401) {
  return Response.json({ success: false, error: message }, { status })
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest, handler: (request: NextRequest, user: User) => Promise<Response>) => {
    const user = await authenticateRequest(request)

    if (!user) {
      return createAuthResponse("Authentication required")
    }

    if (roles && !roles.includes(user.role)) {
      return createAuthResponse("Insufficient permissions", 403)
    }

    return handler(request, user)
  }
}

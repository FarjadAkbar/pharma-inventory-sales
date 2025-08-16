import type { NextRequest } from "next/server"
import { verifyToken, getTokenFromHeaders } from "./jwt"
import type { User } from "@/types/auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: User
}

export async function authenticateRequest(request: NextRequest): Promise<User | null> {
  try {
    const token = getTokenFromHeaders(request.headers)
    if (!token) {
      return null
    }

    const payload = await verifyToken(token)
    return payload as User
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

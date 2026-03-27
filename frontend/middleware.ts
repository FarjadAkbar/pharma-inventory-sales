import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/users",
  "/roles",
  "/permissions",
  "/master-data",
  "/procurement",
  "/quality",
  "/manufacturing",
  "/warehouse",
]

/**
 * Edge-safe JWT payload decode (no jsonwebtoken — avoids Edge/runtime issues).
 */
function decodeJwtPayload(token: string): {
  sub?: number
  id?: number
  exp?: number
  role?: string
  roleName?: string
} | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const segment = parts[1]
    let base64 = segment.replace(/-/g, "+").replace(/_/g, "/")
    const pad = base64.length % 4
    if (pad) base64 += "=".repeat(4 - pad)
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenExpired(payload: { exp?: number }): boolean {
  if (!payload.exp) return false
  return payload.exp <= Math.floor(Date.now() / 1000)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get("pharma_inventory_sales_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")

  // Token is stored in localStorage only when the JWT is large (many permissions).
  // Middleware cannot read localStorage, so allow the request through; client RouteGuard
  // and API Bearer auth enforce access.
  if (!token) {
    return NextResponse.next()
  }

  const userData = decodeJwtPayload(token)
  if (!userData) {
    return NextResponse.next()
  }

  if (isTokenExpired(userData)) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const response = NextResponse.next()
  const userId = userData.sub ?? userData.id
  response.headers.set("x-user-role", userData.role || userData.roleName || "")
  response.headers.set("x-user-id", userId != null ? String(userId) : "")

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

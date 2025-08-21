import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, getTokenFromHeaders } from "@/lib/jwt"
import { canAccessRoute } from "@/lib/permissions"
import type { Role } from "@/lib/permissions"

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"]

// Public routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/forgot-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  if (isProtectedRoute) {
    try {
      const token = getTokenFromHeaders(request.headers)

      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      // Verify token and get user data
      const payload = await verifyToken(token)
      const userRole = payload.role as Role

      // Check if user has permission to access this route
      if (!canAccessRoute(userRole, pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Add user data to headers for use in components
      const response = NextResponse.next()
      response.headers.set("x-user-role", userRole)
      response.headers.set("x-user-id", payload.id as string)

      return response
    } catch (error) {
      console.error("Middleware auth error:", error)
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { extractUserFromToken, isTokenValid } from "@/lib/jwt"

// Protected routes that require authentication
const protectedRoutes = ["/dashboard"]

// Public routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/forgot-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Debug environment
  console.log("Middleware: Environment check")
  console.log("Middleware: NEXT_RUNTIME:", process.env.NEXT_RUNTIME)
  console.log("Middleware: typeof process:", typeof process)
  console.log("Middleware: typeof window:", typeof window)

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
        console.log("Middleware: No token found, redirecting to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      console.log("Middleware: Token found, extracting user data")
      // Verify token and get user data
      const userData = extractUserFromToken(token)
      if (!userData) {
        console.log("Middleware: Failed to extract user data, redirecting to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      console.log("Middleware: User data extracted successfully:", userData)
      
      // Check if token is expired (use decode-only validation for Edge Runtime)
      const currentTime = Math.floor(Date.now() / 1000)
      if (userData.exp <= currentTime) {
        console.log("Middleware: Token expired, redirecting to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      // Add user data to headers for use in components
      const response = NextResponse.next()
      response.headers.set("x-user-role", userData.role)
      response.headers.set("x-user-id", userData.userId.toString())

      console.log("Middleware: Authentication successful, allowing access")
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

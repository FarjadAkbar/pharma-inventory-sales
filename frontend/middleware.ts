import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { extractUserFromToken, isTokenValid } from "@/lib/jwt"

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
  "/distribution",
  "/reports"
]

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password"
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Extract token from cookies or headers
  const token = request.cookies.get("pharma_inventory_sales_token")?.value ||
                request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    console.log("Middleware: No token found, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const userData = extractUserFromToken(token)
  if (!userData) {
    console.log("Middleware: Failed to extract user data, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Check if token is expired
  if (userData.exp) {
    const currentTime = Math.floor(Date.now() / 1000)
    if (userData.exp <= currentTime) {
      console.log("Middleware: Token expired, redirecting to login")
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  const response = NextResponse.next()
  // JWT payload uses 'sub' for user ID (standard JWT claim)
  const userId = userData.sub || userData.id
  response.headers.set("x-user-role", userData.role || "")
  response.headers.set("x-user-id", userId ? userId.toString() : "")

  console.log("Middleware: Authentication successful, allowing access")
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

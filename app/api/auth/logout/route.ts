import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  // In a real app, you might want to blacklist the token
  // For now, we'll just return success since JWT tokens are stateless
  return Response.json({
    success: true,
    message: "Logged out successfully",
  })
}

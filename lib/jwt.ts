import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function signToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export function getTokenFromHeaders(headers: Headers): string | null {
  // First try Authorization header
  const authHeader = headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Then try cookie
  const cookieHeader = headers.get("cookie")
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim())
    const tokenCookie = cookies.find((c) => c.startsWith("crm_token="))
    if (tokenCookie) {
      return tokenCookie.split("=")[1]
    }
  }

  return null
}

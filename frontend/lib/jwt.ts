import jwt from 'jsonwebtoken'
import type { JwtPayload } from '@/types/auth'

const JWT_SECRET = process.env.NEXT_JWT_SECRET || 'pharma-inventory-sales-jwt-secret-key-2024'

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeToken(token)
    if (!decoded) return false
    
    // Check if token has expiration (exp field is automatically added by JWT library)
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000)
      return decoded.exp > currentTime
    }
    
    // If no exp field, assume token is valid (for development)
    return true
  } catch (error) {
    return false
  }
}

export function extractUserFromToken(token: string): JwtPayload | null {
  const decoded = decodeToken(token)
  if (!decoded || !isTokenValid(token)) return null
  return decoded
}

import jwt from 'jsonwebtoken'
import type { JwtPayload } from '@/types/auth'

// Use a simple, consistent secret for development
const JWT_SECRET = 'pharma-inventory-sales-jwt-secret-key-2024'

console.log('JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO')
console.log('JWT_SECRET length:', JWT_SECRET?.length || 0)
console.log('JWT_SECRET value (first 10 chars):', JWT_SECRET?.substring(0, 10))

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Check if we're in Edge Runtime (middleware)
const isEdgeRuntime = typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge'

export function decodeToken(token: string): JwtPayload | null {
  try {
    console.log('=== decodeToken called ===')
    console.log('Token length:', token.length)
    console.log('Token format check:', token.split('.').length === 3 ? 'Valid JWT format' : 'Invalid JWT format')
    
    // In browser or Edge Runtime, only decode without verification
    if (isBrowser || isEdgeRuntime) {
      console.log('Browser/Edge Runtime environment: decoding without verification')
      const decoded = jwt.decode(token) as JwtPayload
      console.log('Token decoded successfully (browser/edge):', decoded)
      return decoded
    }
    
    // In regular server environment, try to verify
    console.log('Regular server environment: attempting verification')
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    console.log('Token verified successfully (server):', decoded)
    return decoded
  } catch (error: any) {
    console.error('=== decodeToken ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    return null
  }
}

export function isTokenValid(token: string): boolean {
  try {
    // In browser or Edge Runtime, only check expiration from decoded token
    if (isBrowser || isEdgeRuntime) {
      const decoded = jwt.decode(token) as JwtPayload
      if (!decoded) return false
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000)
      return decoded.exp > currentTime
    }
    
    // In regular server environment, verify and check expiration
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp > currentTime
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

export function extractUserFromToken(token: string): JwtPayload | null {
  if (!token) {
    console.log('No token provided to extractUserFromToken')
    return null
  }
  
  try {
    console.log('=== extractUserFromToken called ===')
    console.log('Token length:', token.length)
    console.log('Token format check:', token.split('.').length === 3 ? 'Valid JWT format' : 'Invalid JWT format')
    
    // In browser or Edge Runtime, only decode without verification
    if (isBrowser || isEdgeRuntime) {
      console.log('Browser/Edge Runtime environment: decoding without verification')
      const decoded = jwt.decode(token) as JwtPayload
      console.log('User extracted successfully (browser/edge):', decoded)
      return decoded
    }
    
    // In regular server environment, try to verify
    console.log('Regular server environment: attempting verification')
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    console.log('User extracted successfully (server):', decoded)
    return decoded
  } catch (error: any) {
    console.error('=== extractUserFromToken ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    
    // If verification fails, try to decode without verification as fallback
    try {
      console.log('Attempting fallback decode without verification...')
      const fallbackDecoded = jwt.decode(token) as JwtPayload
      console.log('Fallback decode successful:', fallbackDecoded)
      return fallbackDecoded
    } catch (fallbackError: any) {
      console.error('Fallback decode also failed:', fallbackError)
      return null
    }
  }
}

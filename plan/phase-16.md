# Phase 16: Login API Integrations

## Status: 🔄 Ready for Implementation

## Overview
This phase outlines the detailed steps for integrating the frontend login functionality with the backend API, ensuring secure and efficient authentication.

## 16.1 Frontend Setup

### 16.1.1 Environment Variables
Ensure your frontend `.env.local` file is configured correctly:
```env
NEXT_PUBLIC_API=http://localhost:3000/api
NEXT_JWT_SECRET=pharma-inventory-sales-jwt-secret-key-2024
```

### 16.1.2 Next.js Configuration
Update `frontend/next.config.mjs` to expose environment variables:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_JWT_SECRET: process.env.NEXT_JWT_SECRET,
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api',
  },
}

export default nextConfig
```

### 16.1.3 JWT Utility (`frontend/lib/jwt.ts`)
Ensure the JWT secret matches the backend:
```typescript
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
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp > currentTime
  } catch (error) {
    return false
  }
}

export function extractUserFromToken(token: string): JwtPayload | null {
  const decoded = decodeToken(token)
  if (!decoded || !isTokenValid(token)) return null
  return decoded
}
```

### 16.1.4 JWT Types (`frontend/types/auth.ts`)
Update the `JwtPayload` interface to match the backend's token structure:
```typescript
export interface JwtPayload {
  id: number
  site_id: number
  role: string
  permission: any[] // Empty array means all permissions
  iat: number
  exp: number
}

export interface Permission {
  module: string
  actions: string[]
}

export interface ModulePermissions {
  [module: string]: string[]
}

export interface Permissions {
  [key: string]: ModulePermissions
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  clientId: number
  storeId: number
  permissions: Permissions
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface AuthResponse {
  success: boolean
  token: string
  permissions: Permissions
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

### 16.1.5 API Service (`frontend/services/api.service.ts`)
This service automatically adds the `Authorization` header to all requests and **calls backend APIs directly**:

**Important: Use Direct Backend API Calls**
- ✅ **CORRECT**: `await apiService.getUsers({ search: query })` - Direct backend call
- ❌ **AVOID**: `await fetch('/api/users')` - Proxy API call (unless specifically needed)

```typescript
import { authService } from './auth.service'
import type { ApiResponse } from '@/types/auth'

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api'

  private getCurrentStoreId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("current_store_id")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = authService.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const storeId = this.getCurrentStoreId()
    if (storeId) {
      headers["x-store-id"] = storeId
    }

    try {
      window.dispatchEvent(new Event("api:request:start"))
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : ({} as any)

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    } finally {
      window.dispatchEvent(new Event("api:request:stop"))
    }
  }

  // Generic HTTP methods - Direct backend calls
  async get<T>(endpoint: string): Promise<T> { 
    return await this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> { 
    return await this.request<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }
  
  async put<T>(endpoint: string, data?: any): Promise<T> { 
    return await this.request<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }
  
  async delete<T>(endpoint: string): Promise<T> { 
    return await this.request<T>(endpoint, { method: 'DELETE' })
  }
  
  async patch<T>(endpoint: string, data?: any): Promise<T> { 
    return await this.request<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }

  // Example: Users API - Direct backend calls
  async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/users${query ? `?${query}` : ""}`)
  }
}

export const apiService = new ApiService()
```

### 16.1.6 Auth Service (`frontend/services/auth.service.ts`)
Integrate with the `apiService` and handle backend responses:
```typescript
import type {
  User,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ForgotPasswordData,
  AuthResponse,
  ApiResponse,
  JwtPayload,
  Permissions,
} from "@/types/auth"
import { decodeToken, extractUserFromToken, isTokenValid } from "@/lib/jwt"
import { apiService } from "./api.service"

class AuthService {
  private baseUrl = "/api/auth"
  private tokenKey = "pharma_inventory_sales_token"
  private permissionsKey = "pharma_inventory_sales_permissions"

  // Token management
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.tokenKey)
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.permissionsKey)
    }
  }

  // Permissions management
  setPermissions(permissions: Permissions): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.permissionsKey, JSON.stringify(permissions))
    }
  }

  getPermissions(): Permissions | null {
    if (typeof window === "undefined") return null
    const permissions = localStorage.getItem(this.permissionsKey)
    return permissions ? JSON.parse(permissions) : null
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("Login attempt with credentials:", credentials)

    const response = await apiService.post<{ success: boolean; token: string; permissions: Permissions; message?: string }>("/login", credentials)

    console.log("API response:", response)

    if (response.success && response.token) {
      console.log("Login successful, setting token and returning response")
      this.setToken(response.token)

      const permissions = response.permissions || {}
      this.setPermissions(permissions)

      return {
        success: true,
        token: response.token,
        permissions: permissions
      }
    }

    console.log("Login failed, throwing error")
    throw new Error(response.message || "Login failed")
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/register", userData)
    if (response.success && response.token) {
      this.setToken(response.token)
      this.setPermissions(response.permissions)
      return response
    }
    throw new Error("Registration failed")
  }

  async logout(): Promise<void> {
    try {
      await apiService.post("/logout")
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      this.removeToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    const user = this.getUserFromToken()
    if (!user) {
      throw new Error("No user found")
    }

    return {
      id: user.id.toString(),
      email: '', // Not in backend JWT payload
      name: '', // Not in backend JWT payload
      role: user.role,
      clientId: 1, // Default or derive from user.site_id if applicable
      storeId: user.site_id,
      permissions: this.getPermissions() || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiService.post("/change-password", data)
    if (!response.success) {
      throw new Error("Password change failed")
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiService.post("/forgot-password", data)
    if (!response.success) {
      throw new Error("Password reset request failed")
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post("/reset-password", { token, newPassword })
    if (!response.success) {
      throw new Error("Password reset failed")
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getToken()
    return token ? isTokenValid(token) : false
  }

  getUserFromToken(): JwtPayload | null {
    const token = this.getToken()
    return token ? extractUserFromToken(token) : null
  }

  hasPermission(module: string, action: string): boolean {
    const permissions = this.getPermissions()
    if (!permissions) return false
    
    const modulePermissions = permissions[module]
    if (!modulePermissions) return false
    
    return modulePermissions.includes(action) || modulePermissions.includes('*')
  }

  hasAllPermissions(module: string, actions: string[]): boolean {
    return actions.every(action => this.hasPermission(module, action))
  }
}

export const authService = new AuthService()
```

### 16.1.7 Middleware (`frontend/middleware.ts`)
Ensure the middleware correctly extracts user ID from the new JWT payload:
```typescript
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
  const currentTime = Math.floor(Date.now() / 1000)
  if (userData.exp <= currentTime) {
    console.log("Middleware: Token expired, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const response = NextResponse.next()
  response.headers.set("x-user-role", userData.role)
  response.headers.set("x-user-id", userData.id.toString()) // Use userData.id

  console.log("Middleware: Authentication successful, allowing access")
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

## 16.2 Backend Setup (Reference)

### 16.2.1 Environment Variables
Ensure your backend `.env` file is configured:
```env
NEXT_JWT_SECRET=pharma-inventory-sales-jwt-secret-key-2024
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
PORT=3000
```

### 16.2.2 JWT Utility (`backend/src/utils/jwt.ts`)
Ensure the JWT secret matches the frontend:
```typescript
import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXT_JWT_SECRET || 'pharma-inventory-sales-jwt-secret-key-2024';

export function signJwt(payload: any) {
    return jwt.sign(payload, SECRET, { expiresIn: '48h' });
}

export function verifyJwt(token: string) {
    return jwt.verify(token, SECRET);
}
```

### 16.2.3 Auth Route (`backend/src/routes/auth/authRoute.ts`)
The login endpoint should return the JWT with the specified payload:
```typescript
import Router from 'express';
import bcrypt from 'bcryptjs';
import { getUserByUsername, getuserWithPermissions } from '../../services/auth/auth.service';
import { signJwt } from '../../utils/jwt';
import pool from '../../config/db';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        let isAttempt = false;
        const conn = await pool.getConnection();

        if(!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await getUserByUsername(email);
        if(!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
            await conn.query('UPDATE users_tbl SET login_attempts = failed_login_attempt + 1 WHERE id = ?', [user.id]);

            if(user.failed_login_attempt + 1 >= 5) {
                await conn.query(`UPDATE users_tbl SET status = 'InActive' WHERE id = ?`, [user.id]);
                return res.status(403).json({ success: false, message: 'Account locked due to multiple failed login attempts, Contact with Administrator' });
            }
            isAttempt = true;
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if(isAttempt) {
            await conn.query(`UPDATE users_tbl SET failed_login_attempt = 0 WHERE id = ?`, [user.id]);
        }

        const permissions = await getuserWithPermissions(user.id, user.site_id);

        const tokenPayload = {
            id: user.id,
            site_id: user.site_id,
            role: user.role,
            permission: permissions || []
        };

        const token = signJwt(tokenPayload);

        return res.json({ success: true, token: token, permissions: permissions }); // Return permissions as well
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});

export default router;
```

### 16.2.4 Auth Middleware (`backend/src/middlewares/authMiddleware.ts`)
The middleware should correctly verify the token and attach user data:
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader: any = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ status: false, message: 'Missing token' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded: any = verifyJwt(token);
        if (!decoded || !decoded.id || !decoded.site_id || !decoded.role)
            {
                return res.status(401).json({ status: false, message: 'Invalid token payload' });
            }
            (req as any).user =
            {
                id: decoded.id,
                site_id: decoded.site_id ?? null,
                role: decoded.role,
                permissions: decoded.permission || [] // Attach permissions from token
            };
            next();
        } catch {
            return res.status(403).json({ status: false, message: 'Invalid token' });
        }
    }
```

## 16.3 Testing Login Functionality

1. **Start Backend**: Navigate to the `backend` directory and run `npm run dev`.
2. **Start Frontend**: Navigate to the `frontend` directory and run `npm run dev`.
3. **Access Login Page**: Open your browser and go to `http://localhost:3001/auth/login`.
4. **Enter Credentials**: Use valid user credentials from your database.
5. **Verify Authentication**:
   * Upon successful login, you should be redirected to the dashboard.
   * Open your browser's developer tools (Network tab) and observe subsequent API requests. Each request should include an `Authorization: Bearer <token>` header.
   * Check `localStorage` for `pharma_inventory_sales_token` and `pharma_inventory_sales_permissions`.

## 16.4 Implementation Checklist

- [ ] **Environment Variables**: Configure `NEXT_JWT_SECRET` and `NEXT_PUBLIC_API`
- [ ] **JWT Utility**: Update to use environment variable for secret
- [ ] **API Service**: Implement automatic token header injection
- [ ] **Auth Service**: Integrate with backend login API
- [ ] **Middleware**: Update to handle new JWT payload structure
- [ ] **Types**: Define proper TypeScript interfaces
- [ ] **Testing**: Verify login flow and token management

## Next Steps

After completing Phase 16, the login API integration will be fully functional, allowing users to authenticate and access protected routes with proper JWT token management.
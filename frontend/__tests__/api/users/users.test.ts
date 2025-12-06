import { GET, POST, PUT, DELETE } from '@/app/api/users/route'
import type { NextRequest } from 'next/server'

// Mock fetch and auth middleware
global.fetch = jest.fn()

// Mock requireAuth
jest.mock('@/lib/auth-middleware', () => ({
  requireAuth: (roles: string[]) => {
    return (request: NextRequest, handler: Function) => {
      // Mock authenticated user
      const mockUser = { role: 'admin', id: '1' }
      return handler(request, mockUser)
    }
  },
}))

describe('Users API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should fetch users with pagination', async () => {
      const mockResponse = {
        docs: [
          { id: '1', email: 'user1@example.com', name: 'User 1' },
          { id: '2', email: 'user2@example.com', name: 'User 2' },
        ],
        page: 1,
        limit: 10,
        total: 2,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const request = {
        url: 'http://localhost:3000/api/users?page=1&limit=10',
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'authorization') return 'Bearer mock-token'
            return null
          }),
        },
      } as unknown as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.users).toHaveLength(2)
      expect(data.data.pagination.page).toBe(1)
      expect(data.data.pagination.total).toBe(2)
    })

    it('should handle search and role filters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [], page: 1, limit: 10, total: 0 }),
      })

      const request = {
        url: 'http://localhost:3000/api/users?search=admin&role=USER&page=1&limit=10',
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      await GET(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=admin'),
        expect.any(Object)
      )
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const mockUserData = {
        id: '1',
        email: 'newuser@example.com',
        name: 'New User',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })

      const request = {
        json: async () => ({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          roles: ['USER'],
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe('newuser@example.com')
    })

    it('should return 400 if required fields are missing', async () => {
      const request = {
        json: async () => ({
          name: 'New User',
          // Missing email, password, roles
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required')
    })
  })

  describe('PUT /api/users', () => {
    it('should update an existing user', async () => {
      const mockUpdatedUser = {
        id: '1',
        email: 'updated@example.com',
        name: 'Updated User',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedUser,
      })

      const request = {
        json: async () => ({
          id: '1',
          name: 'Updated User',
          email: 'updated@example.com',
          roles: ['USER'],
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Updated User')
    })

    it('should return 400 if id is missing', async () => {
      const request = {
        json: async () => ({
          name: 'Updated User',
          // Missing id
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/users', () => {
    it('should delete a user', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', deleted: true }),
      })

      const request = {
        url: 'http://localhost:3000/api/users?id=1',
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 400 if id is missing', async () => {
      const request = {
        url: 'http://localhost:3000/api/users',
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

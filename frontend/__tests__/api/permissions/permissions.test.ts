import { GET, POST, PUT, DELETE } from '@/app/api/permissions/route'
import type { NextRequest } from 'next/server'

// Mock fetch and auth middleware
global.fetch = jest.fn()

// Mock requireAuth
jest.mock('@/lib/auth-middleware', () => ({
  requireAuth: (roles: string[]) => {
    return (request: NextRequest, handler: Function) => {
      const mockUser = { role: 'admin', id: '1' }
      return handler(request, mockUser)
    }
  },
}))

describe('Permissions API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/permissions', () => {
    it('should fetch permissions with pagination', async () => {
      const mockResponse = {
        docs: [
          { id: '1', name: 'user:create' },
          { id: '2', name: 'user:update' },
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
        url: 'http://localhost:3000/api/permissions?page=1&limit=10',
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.permissions).toHaveLength(2)
      expect(data.data.permissions[0].name).toBe('user:create')
    })
  })

  describe('POST /api/permissions', () => {
    it('should create a new permission', async () => {
      const mockPermission = {
        id: '1',
        name: 'user:delete',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPermission,
      })

      const request = {
        json: async () => ({
          name: 'user:delete',
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('user:delete')
    })

    it('should return 400 if name is missing', async () => {
      const request = {
        json: async () => ({}),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/permissions', () => {
    it('should update an existing permission', async () => {
      const mockUpdatedPermission = {
        id: '1',
        name: 'user:updated',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedPermission,
      })

      const request = {
        json: async () => ({
          id: '1',
          name: 'user:updated',
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('user:updated')
    })
  })

  describe('DELETE /api/permissions', () => {
    it('should delete a permission', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', deleted: true }),
      })

      const request = {
        url: 'http://localhost:3000/api/permissions?id=1',
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

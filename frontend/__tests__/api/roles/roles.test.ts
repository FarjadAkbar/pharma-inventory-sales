import { GET, POST, PUT, DELETE } from '@/app/api/roles/route'
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

describe('Roles API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/roles', () => {
    it('should fetch roles with pagination', async () => {
      const mockResponse = {
        docs: [
          { id: '1', name: 'USER' },
          { id: '2', name: 'BACKOFFICE' },
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
        url: 'http://localhost:3000/api/roles?page=1&limit=10',
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.roles).toHaveLength(2)
      expect(data.data.roles[0].name).toBe('USER')
    })
  })

  describe('POST /api/roles', () => {
    it('should create a new role', async () => {
      const mockRole = {
        id: '1',
        name: 'MANAGER',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRole,
      })

      const request = {
        json: async () => ({
          name: 'MANAGER',
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('MANAGER')
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

  describe('PUT /api/roles', () => {
    it('should update an existing role', async () => {
      const mockUpdatedRole = {
        id: '1',
        name: 'UPDATED_ROLE',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedRole,
      })

      const request = {
        json: async () => ({
          id: '1',
          name: 'UPDATED_ROLE',
        }),
        headers: {
          get: jest.fn(() => 'Bearer mock-token'),
        },
      } as unknown as NextRequest

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('UPDATED_ROLE')
    })
  })

  describe('DELETE /api/roles', () => {
    it('should delete a role', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', deleted: true }),
      })

      const request = {
        url: 'http://localhost:3000/api/roles?id=1',
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

import { POST } from '@/app/api/auth/login/route'
import type { NextRequest } from 'next/server'

// Mock fetch
global.fetch = jest.fn()

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if email or password is missing', async () => {
    const request = {
      json: async () => ({ email: '', password: '' }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email and password are required')
  })

  it('should return 400 if email is missing', async () => {
    const request = {
      json: async () => ({ password: 'password123' }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should return 400 if password is missing', async () => {
    const request = {
      json: async () => ({ email: 'test@example.com' }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should successfully login with valid credentials', async () => {
    const mockResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const request = {
      json: async () => ({
        email: 'admin@admin.com',
        password: 'admin',
      }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.accessToken).toBe('mock-access-token')
    expect(data.refreshToken).toBe('mock-refresh-token')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should handle backend error responses', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    const request = {
      json: async () => ({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const request = {
      json: async () => ({
        email: 'admin@admin.com',
        password: 'admin',
      }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })
})

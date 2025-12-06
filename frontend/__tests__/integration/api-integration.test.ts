/**
 * Integration tests for API endpoints
 * These tests require the backend services to be running
 * Run with: npm test -- api-integration.test.ts
 */

describe('API Integration Tests', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'
  const FRONTEND_API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api'

  let authToken: string

  beforeAll(async () => {
    // Login to get auth token
    try {
      const loginResponse = await fetch(`${FRONTEND_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: 'admin',
        }),
      })

      if (loginResponse.ok) {
        const data = await loginResponse.json()
        authToken = data.accessToken
      }
    } catch (error) {
      console.warn('Could not login for integration tests:', error)
    }
  })

  describe('Login API', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${FRONTEND_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: 'admin',
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('accessToken')
      expect(data).toHaveProperty('refreshToken')
    })

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${FRONTEND_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        }),
      })

      expect(response.ok).toBe(false)
    })
  })

  describe('Users API', () => {
    it('should fetch users list', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token')
        return
      }

      const response = await fetch(`${FRONTEND_API_URL}/users?page=1&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('users')
      expect(data.data).toHaveProperty('pagination')
    })
  })

  describe('Roles API', () => {
    it('should fetch roles list', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token')
        return
      }

      const response = await fetch(`${FRONTEND_API_URL}/roles?page=1&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('roles')
    })
  })

  describe('Permissions API', () => {
    it('should fetch permissions list', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token')
        return
      }

      const response = await fetch(`${FRONTEND_API_URL}/permissions?page=1&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('permissions')
    })
  })
})

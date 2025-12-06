import { authService } from '@/services/auth.service'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock apiService
jest.mock('@/services/api.service', () => ({
  apiService: {
    rawRequest: jest.fn(),
    post: jest.fn(),
  },
}))

import { apiService } from '@/services/api.service'

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('login', () => {
    it('should successfully login and store tokens', async () => {
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }

      ;(apiService.rawRequest as jest.Mock).mockResolvedValueOnce(mockResponse)

      const credentials = {
        email: 'admin@admin.com',
        password: 'admin',
      }

      const result = await authService.login(credentials)

      expect(apiService.rawRequest).toHaveBeenCalledWith('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pharma_inventory_sales_token',
        'mock-access-token'
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pharma_inventory_sales_refresh_token',
        'mock-refresh-token'
      )
      expect(result.success).toBe(true)
      expect(result.token).toBe('mock-access-token')
    })

    it('should throw error if login fails', async () => {
      ;(apiService.rawRequest as jest.Mock).mockResolvedValueOnce({
        accessToken: null,
      })

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrong',
      }

      await expect(authService.login(credentials)).rejects.toThrow('Login failed')
    })
  })

  describe('logout', () => {
    it('should remove tokens and call backend', async () => {
      ;(apiService.post as jest.Mock).mockResolvedValueOnce({ success: true })

      await authService.logout()

      expect(apiService.post).toHaveBeenCalledWith('/logout')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pharma_inventory_sales_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'pharma_inventory_sales_refresh_token'
      )
    })

    it('should remove tokens even if backend call fails', async () => {
      ;(apiService.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await authService.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })
  })

  describe('token management', () => {
    it('should set and get token', () => {
      authService.setToken('test-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pharma_inventory_sales_token',
        'test-token'
      )

      localStorageMock.getItem.mockReturnValueOnce('test-token')
      const token = authService.getToken()
      expect(token).toBe('test-token')
    })

    it('should remove token', () => {
      authService.removeToken()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pharma_inventory_sales_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'pharma_inventory_sales_refresh_token'
      )
    })
  })
})

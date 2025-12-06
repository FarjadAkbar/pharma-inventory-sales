import { UsersApiService } from '@/services/users-api.service'

// Mock BaseApiService
jest.mock('@/services/base-api.service', () => {
  return {
    BaseApiService: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  }
})

describe('UsersApiService', () => {
  let service: UsersApiService
  let mockRequest: jest.Mock

  beforeEach(() => {
    service = new UsersApiService()
    mockRequest = (service as any).request
    jest.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users with default params', async () => {
      const mockResponse = { data: { users: [] } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      await service.getUsers()

      expect(mockRequest).toHaveBeenCalledWith('/users')
    })

    it('should fetch users with search params', async () => {
      const mockResponse = { data: { users: [] } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      await service.getUsers({ search: 'admin', page: 1, limit: 10 })

      expect(mockRequest).toHaveBeenCalledWith('/users?search=admin&page=1&limit=10')
    })
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = { name: 'Test User', email: 'test@example.com', password: 'pass', roles: ['USER'] }
      const mockResponse = { data: { id: '1', ...mockUser } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.createUser(mockUser)

      expect(mockRequest).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(mockUser),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const mockUser = { id: '1', name: 'Updated User' }
      const mockResponse = { data: mockUser }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.updateUser('1', mockUser)

      expect(mockRequest).toHaveBeenCalledWith('/users/1', {
        method: 'PUT',
        body: JSON.stringify(mockUser),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockResponse = { data: { id: '1', deleted: true } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.deleteUser('1')

      expect(mockRequest).toHaveBeenCalledWith('/users/1', { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })
  })
})

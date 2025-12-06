import { RolesApiService } from '@/services/roles-api.service'

// Mock BaseApiService
jest.mock('@/services/base-api.service', () => {
  return {
    BaseApiService: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  }
})

describe('RolesApiService', () => {
  let service: RolesApiService
  let mockRequest: jest.Mock

  beforeEach(() => {
    service = new RolesApiService()
    mockRequest = (service as any).request
    jest.clearAllMocks()
  })

  describe('getRoles', () => {
    it('should fetch roles', async () => {
      const mockResponse = { data: { roles: [] } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      await service.getRoles()

      expect(mockRequest).toHaveBeenCalledWith('/roles')
    })
  })

  describe('createRole', () => {
    it('should create a new role', async () => {
      const mockRole = { name: 'MANAGER' }
      const mockResponse = { data: { id: '1', ...mockRole } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.createRole(mockRole)

      expect(mockRequest).toHaveBeenCalledWith('/roles', {
        method: 'POST',
        body: JSON.stringify(mockRole),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const mockRole = { name: 'UPDATED_ROLE' }
      const mockResponse = { data: { id: '1', ...mockRole } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.updateRole('1', mockRole)

      expect(mockRequest).toHaveBeenCalledWith('/roles/1', {
        method: 'PUT',
        body: JSON.stringify(mockRole),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      const mockResponse = { data: { id: '1', deleted: true } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.deleteRole('1')

      expect(mockRequest).toHaveBeenCalledWith('/roles/1', { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })
  })
})

import { PermissionsApiService } from '@/services/permissions-api.service'

// Mock BaseApiService
jest.mock('@/services/base-api.service', () => {
  return {
    BaseApiService: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  }
})

describe('PermissionsApiService', () => {
  let service: PermissionsApiService
  let mockRequest: jest.Mock

  beforeEach(() => {
    service = new PermissionsApiService()
    mockRequest = (service as any).request
    jest.clearAllMocks()
  })

  describe('getPermissions', () => {
    it('should fetch permissions', async () => {
      const mockResponse = { data: { permissions: [] } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      await service.getPermissions()

      expect(mockRequest).toHaveBeenCalledWith('/permissions')
    })
  })

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      const mockPermission = { name: 'user:delete' }
      const mockResponse = { data: { id: '1', ...mockPermission } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.createPermission(mockPermission)

      expect(mockRequest).toHaveBeenCalledWith('/permissions', {
        method: 'POST',
        body: JSON.stringify(mockPermission),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updatePermission', () => {
    it('should update an existing permission', async () => {
      const mockPermission = { name: 'user:updated' }
      const mockResponse = { data: { id: '1', ...mockPermission } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.updatePermission('1', mockPermission)

      expect(mockRequest).toHaveBeenCalledWith('/permissions/1', {
        method: 'PUT',
        body: JSON.stringify(mockPermission),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      const mockResponse = { data: { id: '1', deleted: true } }
      mockRequest.mockResolvedValueOnce(mockResponse)

      const result = await service.deletePermission('1')

      expect(mockRequest).toHaveBeenCalledWith('/permissions/1', { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })
  })
})

export interface Supplier {
  id: number
  site_id: number
  code: string
  name: string
  contact: string
  address: string
  approved: number // 1 for true, 0 for false
  rating: string
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
}

export interface CreateSupplierData {
  site_id: number
  code: string
  name: string
  contact: string
  address: string
  approved: boolean
  rating: number
}

export interface UpdateSupplierData {
  site_id: number
  code: string
  name: string
  contact: string
  address: string
  approved: boolean
  rating: number
}

export interface SupplierApiResponse {
  status: boolean
  data: Supplier | Supplier[]
  message?: string
}

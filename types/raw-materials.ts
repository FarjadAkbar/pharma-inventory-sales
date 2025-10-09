export interface RawMaterial {
  id: number
  code: string
  raw_material_name: string
  description: string
  grade: string | null
  storage_req: string | null
  status: "Active" | "InActive"
  unit_id: number
  supplier_id: number
  unit_name: string
  unit_type: string
  unit_desc: string
  site_id: number
  site_name: string
  supplier_code: string
  supplier_name: string
  supplier_contact: string
  supplier_address: string
  supplier_approved: string
  supplier_rating: string
  site_location: string
}

export interface CreateRawMaterialData {
  code: string
  name: string
  description: string
  grade: string
  storage_req: string
  unit_id: number
  supplier_id: number
  status: "Active" | "InActive"
}

export interface UpdateRawMaterialData {
  code: string
  name: string
  description: string
  grade: string
  storage_req: string
  unit_id: number
  supplier_id: number
  status: "Active" | "InActive"
}

export interface RawMaterialApiResponse {
  status: boolean
  data: RawMaterial | RawMaterial[]
  message?: string
}

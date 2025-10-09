export interface PurchaseOrderItem {
  id?: number
  material_id: number
  material_name?: string
  material_description?: string
  qty: number
  unit_id: number
  unit_name?: string
  unit_type?: string
  unit_price: number
  created_at?: string
  updated_at?: string
}

export interface PurchaseOrder {
  id: number
  site_id: number
  supplier_id: number
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Completed"
  expected_date: string
  total_amount: string | number
  currency: string
  note: string
  name?: string // Site name
  location?: string // Site location
  created_at: string
  updated_at: string
  items: PurchaseOrderItem[]
}

export interface CreatePurchaseOrderData {
  site_id: number
  supplier_id: number
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Completed"
  expected_date: string
  total_amount: number
  currency: string
  note: string
  items: {
    material_id: number
    qty: number
    unit_id: number
    unit_price: number
  }[]
}

export interface UpdatePurchaseOrderData {
  site_id: number
  supplier_id: number
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Completed"
  expected_date: string
  total_amount: number
  currency: string
  note: string
  items: {
    material_id: number
    qty: number
    unit_id: number
    unit_price: number
  }[]
}

export interface SupplierOption {
  id: number
  name: string
}

export interface PurchaseOrderApiResponse {
  status: boolean
  data: PurchaseOrder | PurchaseOrder[]
  message?: string
}

export interface SupplierListApiResponse {
  status: boolean
  data: SupplierOption[]
  message?: string
}

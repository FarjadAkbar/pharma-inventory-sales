export type StoreId = string

export interface Store {
  id: StoreId
  name: string
  city: string
  address: string
  image?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type Role = "admin" | "store_manager" | "employee"

export type Screen =
  | "dashboard"
  | "products"
  | "suppliers"
  | "categories"
  | "units"
  | "equipment"
  | "sales"
  | "pos"
  | "users"
  | "stores"
  | "leads"
  | "crm_tasks"

export type PermissionAction = "view" | "create" | "edit" | "delete"

export interface ScreenPermission {
  screen: Screen
  actions: PermissionAction[]
}

export interface StoreUserAssignment {
  userId: string
  storeId: StoreId
  screenPermissions: ScreenPermission[]
}



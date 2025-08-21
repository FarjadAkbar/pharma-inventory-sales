import type { User } from "@/types/auth"
import type { Store } from "@/types/tenant"

// Mock users database
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@pharma-inventory-sales.com", // Updated email domain
    name: "Admin User",
    role: "admin",
    assignedStores: ["store-1", "store-2"],
    defaultStoreId: "store-1",
    screenPermissions: [
      { screen: "dashboard", actions: ["view", "create", "edit", "delete"] },
      { screen: "products", actions: ["view", "create", "edit", "delete"] },
      { screen: "vendors", actions: ["view", "create", "edit", "delete"] },
      { screen: "categories", actions: ["view", "create", "edit", "delete"] },
      { screen: "sales", actions: ["view", "create", "edit", "delete"] },
      { screen: "pos", actions: ["view", "create", "edit", "delete"] },
      { screen: "users", actions: ["view", "create", "edit", "delete"] },
      { screen: "stores", actions: ["view", "create", "edit", "delete"] },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "manager@pharma-inventory-sales.com", // Updated email domain
    name: "Manager User",
    role: "store_manager",
    assignedStores: ["store-1"],
    screenPermissions: [
      { screen: "dashboard", actions: ["view"] },
      { screen: "products", actions: ["view", "create", "edit", "delete"] },
      { screen: "vendors", actions: ["view", "create", "edit"] },
      { screen: "categories", actions: ["view", "create", "edit", "delete"] },
      { screen: "sales", actions: ["view", "create"] },
      { screen: "pos", actions: ["view"] },
      { screen: "users", actions: ["view", "create", "edit", "delete"] },
    ],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    email: "user@pharma-inventory-sales.com", // Updated email domain
    name: "Regular User",
    role: "employee",
    assignedStores: ["store-1"],
    screenPermissions: [
      { screen: "dashboard", actions: ["view"] },
      { screen: "products", actions: ["view"] },
      { screen: "pos", actions: ["view"] },
      { screen: "sales", actions: ["create"] },
    ],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "4",
    email: "manager2@pharma-inventory-sales.com", // Updated email domain
    name: "Manager User",
    role: "store_manager",
    assignedStores: ["store-2"],
    screenPermissions: [
      { screen: "dashboard", actions: ["view"] },
      { screen: "products", actions: ["view", "create", "edit", "delete"] },
      { screen: "vendors", actions: ["view", "create", "edit"] },
      { screen: "categories", actions: ["view", "create", "edit", "delete"] },
      { screen: "sales", actions: ["view", "create"] },
      { screen: "pos", actions: ["view"] },
      { screen: "users", actions: ["view", "create", "edit", "delete"] },
    ],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
]

// Mock passwords (in real app, these would be hashed)
export const mockPasswords: Record<string, string> = {
  "admin@pharma-inventory-sales.com": "Admin123!", // Updated email domain
  "manager@pharma-inventory-sales.com": "Manager123!", // Updated email domain
  "user@pharma-inventory-sales.com": "User123!", // Updated email domain
  "manager2@pharma-inventory-sales.com": "Manager123!", // Updated email domain
}

// Mock products
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  vendor: string
  stock: number
  sku: string
  storeId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Pro 15",
    description: "High-performance laptop for professionals",
    price: 1299.99,
    category: "Electronics",
    vendor: "Tech Corp",
    stock: 25,
    sku: "LP15-001",
    storeId: "store-1",
    createdBy: "1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking",
    price: 49.99,
    category: "Accessories",
    vendor: "Peripheral Plus",
    stock: 150,
    sku: "WM-002",
    storeId: "store-2",
    createdBy: "1",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
]

export const mockStores: Store[] = [
  {
    id: "store-1",
    name: "Central Pharmacy",
    city: "Karachi",
    address: "Main Road 123",
    image: "",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "1",
  },
  {
    id: "store-2",
    name: "Downtown Pharmacy",
    city: "Lahore",
    address: "Market 45",
    image: "",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    createdBy: "1",
  },
]

// Mock vendors
export interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  contactPerson: string
  createdAt: string
  updatedAt: string
}

export const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Tech Corp",
    email: "contact@techcorp.com",
    phone: "+1-555-0123",
    address: "123 Tech Street, Silicon Valley, CA 94000",
    contactPerson: "John Smith",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Peripheral Plus",
    email: "sales@peripheralplus.com",
    phone: "+1-555-0456",
    address: "456 Hardware Ave, Austin, TX 78701",
    contactPerson: "Sarah Johnson",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
]

// Mock categories
export interface Category {
  id: string
  name: string
  description: string
  parentId?: string
  createdAt: string
  updatedAt: string
}

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Accessories",
    description: "Computer and electronic accessories",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
]

// Mock sales
export interface Sale {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
  }[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export const mockSales: Sale[] = [
  {
    id: "1",
    customerId: "cust-1",
    customerName: "Alice Brown",
    customerEmail: "alice@example.com",
    items: [
      {
        productId: "1",
        productName: "Laptop Pro 15",
        quantity: 1,
        price: 1299.99,
      },
    ],
    total: 1299.99,
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    customerId: "cust-2",
    customerName: "Bob Wilson",
    customerEmail: "bob@example.com",
    items: [
      {
        productId: "2",
        productName: "Wireless Mouse",
        quantity: 2,
        price: 49.99,
      },
    ],
    total: 99.98,
    status: "pending",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
]

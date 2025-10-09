# Phase 18: Raw Material and Purchase Order API Integration

## Status: Ready for Implementation

## Overview

This phase outlines the detailed steps for integrating the frontend Raw Material and Purchase Order functionality with the backend API, ensuring proper CRUD operations, permission-based access control, and dynamic item management.

## 18.1 Raw Material API Integration

### 18.1.1 Type Definitions

Create `frontend/types/raw-materials.ts`:

```typescript
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
```

### 18.1.2 API Service Layer

Create `frontend/services/raw-materials-api.service.ts`:

```typescript
"use client"

import { BaseApiService } from "./base-api.service"
import type { RawMaterialApiResponse, CreateRawMaterialData, UpdateRawMaterialData } from "@/types/raw-materials"

export class RawMaterialsApiService extends BaseApiService {
  async getRawMaterials(): Promise<RawMaterialApiResponse> {
    console.log("API getRawMaterials called at:", new Date().toISOString())
    return this.rawRequest<RawMaterialApiResponse>("/rawmaterial/getAllRawMaterials")
  }

  async getRawMaterial(id: number): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>(`/rawmaterial/${id}`)
  }

  async createRawMaterial(data: CreateRawMaterialData): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>("/rawmaterial", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async updateRawMaterial(id: number, data: UpdateRawMaterialData): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>(`/rawmaterial/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  }

  async deleteRawMaterial(id: number): Promise<RawMaterialApiResponse> {
    return this.rawRequest<RawMaterialApiResponse>(`/rawmaterial/${id}`, {
      method: "DELETE"
    })
  }

  invalidateRawMaterials() {
    this.invalidateCache("raw-materials")
  }
}
```

### 18.1.3 Export Service

Update `frontend/services/index.ts` to export the new service:

```typescript
import { RawMaterialsApiService } from "./raw-materials-api.service"

export const rawMaterialsApi = new RawMaterialsApiService()
```

### 18.1.4 Raw Materials List Page

Create/Update `frontend/app/dashboard/raw-materials/page.tsx`:

**Key Features:**

- Display raw materials in UnifiedDataTable
- Show: Code, Name, Description, Grade, Storage Requirements, Status, Unit, Supplier
- Add "Add Raw Material" button with permission guard
- Edit and Delete actions with permission guards
- Status badge (green for Active, red for InActive)

**Columns:**

```typescript
const columns = [
  { key: "code", header: "Code" },
  { key: "raw_material_name", header: "Name" },
  { key: "description", header: "Description" },
  { key: "grade", header: "Grade" },
  { key: "storage_req", header: "Storage Requirements" },
  { key: "status", header: "Status" }, // Badge component
  { key: "unit_name", header: "Unit" },
  { key: "supplier_name", header: "Supplier" },
]
```

**Permission Guards:**

- Module: `MASTER_DATA`
- Screen: `raw-materials`
- Actions: `create`, `update`, `delete`, `read`

### 18.1.5 Raw Material Form Component

Create `frontend/components/raw-materials/raw-material-form.tsx`:

**Form Fields:**

- Code: Text input (required)
- Name: Text input (required)
- Description: Textarea (required)
- Grade: Text input (optional)
- Storage Requirements: Text input (optional)
- Unit: Dropdown/Select (required) - Fetch from suppliers API
- Supplier: Dropdown/Select (required) - Fetch from suppliers API
- Status: Switch component (Active/InActive, default: Active)

**API Calls:**

- Fetch units: Use existing units API if available
- Fetch suppliers: Use `suppliersApi.getSuppliers()`
- On submit: Call `rawMaterialsApi.createRawMaterial()` or `rawMaterialsApi.updateRawMaterial()`

**Validation:**

- Code, Name, Description: Required
- Unit ID and Supplier ID: Must be valid numbers

### 18.1.6 Create/Edit Pages

- Create: `frontend/app/dashboard/raw-materials/new/page.tsx`
- Edit: `frontend/app/dashboard/raw-materials/[id]/page.tsx`

Both pages will use the RawMaterialForm component with appropriate props.

## 18.2 Purchase Order API Integration

### 18.2.1 Type Definitions

Create `frontend/types/purchase-orders.ts`:

```typescript
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
```

### 18.2.2 API Service Layer

Create `frontend/services/purchase-orders-api.service.ts`:

```typescript
"use client"

import { BaseApiService } from "./base-api.service"
import type { 
  PurchaseOrderApiResponse, 
  CreatePurchaseOrderData, 
  UpdatePurchaseOrderData,
  SupplierListApiResponse 
} from "@/types/purchase-orders"

export class PurchaseOrdersApiService extends BaseApiService {
  async getAllPurchaseOrders(): Promise<PurchaseOrderApiResponse> {
    console.log("API getAllPurchaseOrders called at:", new Date().toISOString())
    return this.rawRequest<PurchaseOrderApiResponse>("/purchaseorders/all")
  }

  async getPurchaseOrdersBySite(siteId: number): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/site/${siteId}`)
  }

  async getSuppliersList(): Promise<SupplierListApiResponse> {
    return this.rawRequest<SupplierListApiResponse>("/purchaseorders/supplier/all")
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>("/purchaseorders", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async updatePurchaseOrder(id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  }

  async deletePurchaseOrder(id: number): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/${id}`, {
      method: "DELETE"
    })
  }

  async deletePurchaseOrderItem(poId: number, itemId: number): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/${poId}/items/${itemId}`, {
      method: "DELETE"
    })
  }

  invalidatePurchaseOrders() {
    this.invalidateCache("purchase-orders")
  }
}
```

### 18.2.3 Export Service

Update `frontend/services/index.ts`:

```typescript
import { PurchaseOrdersApiService } from "./purchase-orders-api.service"

export const purchaseOrdersApi = new PurchaseOrdersApiService()
```

### 18.2.4 Purchase Orders Page with Tabs

Create `frontend/app/dashboard/procurement/purchase-orders/page.tsx`:

**Tab Structure:**

- Tab 1: "All Orders" - Display all purchase orders
- Tab 2: "By Site" - Filter by site dropdown
- Tab 3: "Suppliers" - Display supplier list

**All Orders Tab:**

- Display orders in UnifiedDataTable
- Columns: PO ID, Site Name, Supplier, Status, Expected Date, Total Amount, Currency, Created Date
- Status badge with colors (Draft: gray, Pending: yellow, Approved: green, Rejected: red, Completed: blue)
- Actions: View Details, Edit, Delete (with permission guards)

**By Site Tab:**

- Site dropdown filter at the top
- Same table structure as All Orders
- Filter data by selected site_id

**Suppliers Tab:**

- Simple list/table of suppliers (ID, Name)
- Read-only view

**Permission Guards:**

- Module: `PROCUREMENT`
- Screen: `purchase-orders`
- Actions: `create`, `update`, `delete`, `read`

### 18.2.5 Purchase Order Form Component

Create `frontend/components/procurement/purchase-order-form.tsx`:

**Form Structure:**

**Section 1: Header Information**

- Site: Dropdown/Select (required) - Fetch from sitesApi
- Supplier: Dropdown/Select (required) - Fetch from purchaseOrdersApi.getSuppliersList()
- Status: Dropdown (Draft/Pending/Approved/Rejected/Completed)
- Expected Date: Date picker (required)
- Currency: Text input (default: USD)
- Note: Textarea (optional)

**Section 2: Items Management (Dynamic Array)**

- Add Item button to add new rows
- Each item row contains:
  - Material: Dropdown (required) - Fetch from rawMaterialsApi
  - Quantity: Number input (required, min: 1)
  - Unit: Auto-populated from selected material
  - Unit Price: Number input (required, min: 0)
  - Line Total: Calculated (qty * unit_price)
  - Remove button (for each item)

**Section 3: Summary**

- Total Amount: Auto-calculated sum of all line totals
- Display prominently

**Validation:**

- Site, Supplier, Expected Date: Required
- At least 1 item must be added
- Each item: material_id, qty, unit_id, unit_price required
- Quantities and prices must be positive numbers

**API Calls:**

- Fetch sites: `sitesApi.getSites()`
- Fetch suppliers: `purchaseOrdersApi.getSuppliersList()`
- Fetch raw materials: `rawMaterialsApi.getRawMaterials()`
- On submit: `purchaseOrdersApi.createPurchaseOrder()` or `purchaseOrdersApi.updatePurchaseOrder()`

### 18.2.6 Create/Edit Pages

- Create: `frontend/app/dashboard/procurement/purchase-orders/new/page.tsx`
- Edit: `frontend/app/dashboard/procurement/purchase-orders/[id]/page.tsx`

Both pages will use the PurchaseOrderForm component.

### 18.2.7 Purchase Order Details/View Page

Create `frontend/app/dashboard/procurement/purchase-orders/[id]/view/page.tsx`:

**Display:**

- Header section with PO details (read-only)
- Items table showing all items with calculated totals
- Status badge
- Edit button (with permission guard)
- Delete button (with permission guard)
- Print/Export functionality (optional)

## 18.3 UI Components

### 18.3.1 Status Badge Component

Reuse existing Badge component with color mapping:

- Active/Approved: Green
- InActive/Rejected: Red
- Draft: Gray
- Pending: Yellow
- Completed: Blue

### 18.3.2 Dynamic Item Array Component

Create a reusable component for managing dynamic item arrays in forms:

- Add/Remove rows
- Real-time calculations
- Validation per row

## 18.4 Implementation Checklist

1. Create type definitions for Raw Materials
2. Create RawMaterialsApiService
3. Create Raw Materials list page
4. Create Raw Material form component
5. Create Raw Material create/edit pages
6. Create type definitions for Purchase Orders
7. Create PurchaseOrdersApiService
8. Create Purchase Orders page with tabs
9. Create Purchase Order form with dynamic items
10. Create Purchase Order create/edit pages
11. Create Purchase Order view/details page
12. Test all CRUD operations
13. Verify permission guards
14. Test form validations
15. Test dynamic item management

## 18.5 Testing Notes

- Test with empty permissions `{}` (System Administrator access)
- Test with specific module permissions
- Verify all API responses match expected format
- Test form validations (required fields, number validations)
- Test dynamic item addition/removal
- Test total amount calculations
- Verify status dropdown values match backend
- Test date picker functionality
- Verify supplier and site dropdowns populate correctly

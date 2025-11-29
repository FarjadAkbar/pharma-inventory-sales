# Phase 4: Procurement Module

## Status: 🔄 Ready for Implementation

## Overview
Implement procurement functionality including purchase orders, goods receipts, and supplier management.

## Implementation Tasks

### 4.1 Purchase Order Management
- [ ] PO list page (`/dashboard/procurement/purchase-orders`)
- [ ] Create PO form (`/dashboard/procurement/purchase-orders/new`)
- [ ] Edit PO form (`/dashboard/procurement/purchase-orders/[id]`)
- [ ] PO approval workflow
- [ ] Status tracking

### 4.2 Goods Receipt Management
- [ ] GRN list page (`/dashboard/procurement/goods-receipts`)
- [ ] Create GRN form (`/dashboard/procurement/goods-receipts/new`)
- [ ] Edit GRN form (`/dashboard/procurement/goods-receipts/[id]`)
- [ ] CoA upload functionality
- [ ] QC sample request generation

## Data Models

```typescript
interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  siteId: string;
  expectedDate: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Received';
  items: POItem[];
  totalAmount: number;
}

interface POItem {
  id: string;
  materialId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  totalPrice: number;
}

interface GoodsReceipt {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  receivedDate: string;
  items: GRNItem[];
  status: 'Draft' | 'Verified' | 'Completed';
}
```

## Workflow

1. **PO Creation**: Procurement manager creates PO
2. **Approval**: PO goes through approval workflow
3. **Supplier Delivery**: Supplier delivers materials
4. **Goods Receipt**: Create GRN against PO
5. **QC Sampling**: Generate QC sample requests
6. **QA Release**: Materials released for use

## API Endpoints

- `GET /api/procurement/purchase-orders` - List POs
- `POST /api/procurement/purchase-orders` - Create PO
- `PUT /api/procurement/purchase-orders/[id]` - Update PO
- `POST /api/procurement/purchase-orders/[id]/approve` - Approve PO
- `GET /api/procurement/goods-receipts` - List GRNs
- `POST /api/procurement/goods-receipts` - Create GRN

## Testing Checklist

- [ ] PO creation and management
- [ ] Approval workflow
- [ ] GRN creation
- [ ] Item validation
- [ ] Status tracking
- [ ] Integration with master data

## Next Steps

After completing Phase 4, proceed to Phase 5: Quality Control Module

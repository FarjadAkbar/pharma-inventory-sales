# Phase 9: Distribution & Sales

## Status: 🔄 Ready for Implementation

## Overview
Implement distribution and sales functionality including sales orders, shipments, and delivery management.

## Implementation Tasks

### 9.1 Sales Order Management
- [ ] Order entry screen (`/dashboard/sales/orders`)
- [ ] Create order form (`/dashboard/sales/orders/new`)
- [ ] Edit order form (`/dashboard/sales/orders/[id]`)
- [ ] Order approval workflow

### 9.2 Shipment Management
- [ ] Shipment dashboard (`/dashboard/distribution/shipments`)
- [ ] Order allocation
- [ ] Pick list generation
- [ ] Shipping documentation

### 9.3 Delivery Management
- [ ] Proof of delivery (`/dashboard/distribution/pod`)
- [ ] Delivery confirmation
- [ ] Photo documentation
- [ ] Exception handling

## Data Models

```typescript
interface SalesOrder {
  id: string;
  soNumber: string;
  accountId: string;
  siteId: string;
  requestedShipDate: string;
  items: SOItem[];
  status: 'Draft' | 'Approved' | 'Shipped' | 'Delivered';
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  salesOrderId: string;
  carrierId: string;
  trackingNumber: string;
  status: 'Preparing' | 'Shipped' | 'InTransit' | 'Delivered';
}

interface SOItem {
  id: string;
  drugId: string;
  batchPreference: 'FEFO' | 'Specific';
  quantity: number;
  unitId: string;
  price: number;
}
```

## API Endpoints

- `GET /api/distribution/sales-orders` - List sales orders
- `POST /api/distribution/sales-orders` - Create sales order
- `GET /api/distribution/shipments` - List shipments
- `POST /api/distribution/shipments` - Create shipment
- `GET /api/distribution/shipments/[id]/track` - Track shipment

## Next Steps

After completing Phase 9, proceed to Phase 10: User Management

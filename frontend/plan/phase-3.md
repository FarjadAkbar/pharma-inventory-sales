# Phase 3: Master Data Management

## Status: 🔄 Ready for Implementation

## Overview
Implement master data management for drugs, raw materials, and suppliers with CRUD operations and approval workflows.

## Implementation Tasks

### 3.1 Drugs Management
- [ ] Drug list page (`/dashboard/drugs`)
- [ ] Create drug form (`/dashboard/drugs/new`)
- [ ] Edit drug form (`/dashboard/drugs/[id]`)
- [ ] Drug approval workflow
- [ ] Search and filter functionality

### 3.2 Raw Materials Management
- [ ] Raw materials list page (`/dashboard/raw-materials`)
- [ ] Create material form (`/dashboard/raw-materials/new`)
- [ ] Edit material form (`/dashboard/raw-materials/[id]`)
- [ ] Grade specification management
- [ ] Supplier association

### 3.3 Suppliers Management
- [ ] Suppliers list page (`/dashboard/suppliers`)
- [ ] Create supplier form (`/dashboard/suppliers/new`)
- [ ] Edit supplier form (`/dashboard/suppliers/[id]`)
- [ ] Performance metrics dashboard
- [ ] Rating system

## Data Models

```typescript
interface Drug {
  id: string;
  code: string;
  name: string;
  formula: string;
  strength: string;
  dosageForm: string;
  route: string;
  description: string;
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
}

interface RawMaterial {
  id: string;
  code: string;
  name: string;
  grade: string;
  unit: string;
  supplierId: string;
  storageRequirements: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: 'Active' | 'Inactive';
}
```

## API Endpoints

- `GET /api/drugs` - List drugs
- `POST /api/drugs` - Create drug
- `PUT /api/drugs/[id]` - Update drug
- `DELETE /api/drugs/[id]` - Delete drug
- `POST /api/drugs/[id]/approve` - Approve drug

## Testing Checklist

- [ ] CRUD operations for all entities
- [ ] Form validation
- [ ] Search and filter functionality
- [ ] Approval workflows
- [ ] Data relationships
- [ ] Permission-based access

## Next Steps

After completing Phase 3, proceed to Phase 4: Procurement Module

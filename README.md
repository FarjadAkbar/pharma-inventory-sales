# Ziauddin Hospital Pharma System - Frontend Development Plan
## 10-Phase Production Implementation Guide

### Theme Configuration
- **Primary Colors**: Orange (#FF6B35), White (#FFFFFF), Black (#000000)
- **UI Framework**: Shadcn/ui with custom orange theme
- **Typography**: Inter (headings), Roboto (body)
- **Design System**: Material Design 3 principles with pharmaceutical industry focus

---

## Phase 1: Authentication & User Management
### 1.1 Login Flow

#### Login Screen Fields
```typescript
interface LoginForm {
  email: string;           // Required, email validation
  password: string;        // Required, min 8 characters
  rememberMe: boolean;     // Optional, persist session
  organization: string;    // Dropdown for multi-tenant
}
```

#### Login Actions
1. **Form Validation**: Real-time validation with error states
2. **Authentication**: JWT token exchange with refresh mechanism
3. **Role Detection**: Automatic role-based dashboard routing
4. **Session Management**: Secure token storage and refresh
5. **Audit Logging**: All login attempts logged with IP and timestamp

#### API Interactions
- `POST /api/auth/login` → Returns user profile + permissions
- `POST /api/auth/refresh` → Token refresh mechanism
- `GET /api/auth/me` → Current user validation

#### Screens
- **Login Page** (`/auth/login`)
  - Clean form with orange accent
  - Organization selector dropdown
  - Password visibility toggle
  - "Forgot Password" link
  - Loading states and error handling

- **Forgot Password** (`/auth/forgot-password`)
  - Email input with validation
  - Reset link generation
  - Success/error feedback

- **Change Password** (`/auth/change-password`)
  - Current password verification
  - New password with strength indicator
  - Confirmation field

### 1.2 User Management Screens
- **User List** (`/dashboard/users`)
  - Data table with search/filter
  - Role assignment interface
  - Status management (Active/Inactive)
  - Bulk actions for user management

- **User Profile** (`/dashboard/users/[id]`)
  - Personal information form
  - Role and permission matrix
  - Activity history
  - Password reset functionality

---

## Phase 2: Dashboard & Navigation
### 2.1 Main Dashboard
#### Role-Based Dashboard Cards
- **System Admin**: System health, user activity, audit logs
- **Org Admin**: Organization metrics, user management, site overview
- **Procurement Manager**: Pending POs, supplier performance, GRN status
- **Production Manager**: Active batches, work orders, EBR status
- **QC Manager**: Sample queue, test results, OOS alerts
- **QA Manager**: Pending releases, deviations, approval queue
- **Warehouse Ops**: Stock levels, putaway queue, cycle counts
- **Distribution Ops**: Shipment status, cold chain alerts, POD pending
- **Sales Rep**: Order pipeline, account activities, POS metrics

#### Navigation Structure
```typescript
interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  permissions: string[];
  children?: NavigationItem[];
}
```

### 2.2 Theme Implementation
- **Orange Theme**: Primary actions, highlights, progress indicators
- **White Background**: Clean, medical-grade appearance
- **Black Text**: High contrast for readability
- **Shadcn Components**: Customized with pharmaceutical color scheme

---

## Phase 3: Master Data Management
### 3.1 Drugs Management
#### Drug List Screen (`/dashboard/drugs`)
- **Data Table Features**:
  - Search by code, name, formula, strength
  - Filter by dosage form, route, approval status
  - Sort by creation date, approval status
  - Bulk actions: approve, reject, archive

#### Drug Form Screen (`/dashboard/drugs/new` & `/dashboard/drugs/[id]`)
```typescript
interface DrugForm {
  code: string;              // Auto-generated or manual
  name: string;              // Required
  formula: string;           // Chemical formula
  strength: string;          // e.g., "500mg", "10ml"
  dosageForm: string;        // Tablet, Capsule, Syrup, etc.
  route: string;             // Oral, IV, IM, etc.
  description: string;       // Detailed description
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
}
```

#### API Interactions
- `GET /api/drugs` → List with pagination and filters
- `POST /api/drugs` → Create new drug
- `PUT /api/drugs/[id]` → Update drug information
- `DELETE /api/drugs/[id]` → Soft delete (status change)

### 3.2 Raw Materials Management
- Similar structure to drugs with additional fields:
  - Grade specification
  - Unit of measure
  - Supplier information
  - Storage requirements

### 3.3 Suppliers Management
- **Supplier List**: Performance metrics, approval status
- **Supplier Form**: Contact details, address, rating system
- **Performance Dashboard**: Delivery times, quality scores

---

## Phase 4: Procurement Module
### 4.1 Purchase Order Management
#### PO List Screen (`/dashboard/procurement/purchase-orders`)
- **Status Indicators**: Draft, Pending Approval, Approved, Received
- **Quick Actions**: Create, Edit, Approve, View Details
- **Filters**: Supplier, Status, Date Range, Amount

#### PO Builder Screen (`/dashboard/procurement/purchase-orders/new`)
```typescript
interface PurchaseOrderForm {
  supplierId: string;        // Required, dropdown selection
  siteId: string;           // Required, warehouse location
  expectedDate: Date;       // Required, delivery expectation
  items: POItem[];          // Dynamic list of materials
  notes: string;            // Optional, special instructions
}

interface POItem {
  materialId: string;       // Raw material selection
  quantity: number;         // Required, positive number
  unitId: string;          // Unit of measure
  unitPrice: number;       // Price per unit
  totalPrice: number;      // Calculated automatically
}
```

#### PO Approval Workflow
1. **Draft Creation**: Procurement manager creates PO
2. **Approval Queue**: Shows pending approvals
3. **Approval Action**: Approve/Reject with comments
4. **Status Update**: Automatic status changes

### 4.2 Goods Receipt Management
#### GRN Screen (`/dashboard/procurement/goods-receipts`)
- **Receipt Form**: Against specific PO
- **Item Verification**: Quantity, batch numbers, condition
- **CoA Upload**: Certificate of Analysis attachment
- **QC Sample Request**: Auto-generate sample requests

#### API Interactions
- `POST /api/goods-receipts` → Create GRN
- `POST /api/goods-receipts/[id]/samples` → Generate QC samples
- `GET /api/goods-receipts` → List with PO references

---

## Phase 5: Quality Control Module
### 5.1 QC Test Management
#### Test Library Screen (`/dashboard/quality/qc-tests`)
- **Test Catalog**: Available tests with specifications
- **Test Creation**: New test methods and parameters
- **Specification Management**: Min/max values, units

#### Sample Queue Screen (`/dashboard/quality/samples`)
- **Pending Samples**: Queue of samples awaiting testing
- **Sample Details**: Source information, test requirements
- **Priority Assignment**: Urgent, Normal, Low priority

### 5.2 Sample Results Entry
#### Results Entry Screen (`/dashboard/quality/samples/[id]/results`)
```typescript
interface SampleResultForm {
  testId: string;           // Selected test method
  resultValue: string;      // Measured value
  unitId: string;          // Unit of measurement
  passed: boolean;         // Pass/Fail determination
  remarks: string;         // Additional notes
  attachmentId?: string;   // Supporting documents
}
```

#### QC Workflow
1. **Sample Request**: Auto-generated from GRN or batch
2. **Test Assignment**: QC analyst selects tests
3. **Results Entry**: Input measured values
4. **Pass/Fail Determination**: Automatic based on specs
5. **QA Submission**: Send to QA for review

---

## Phase 6: Quality Assurance Module
### 6.1 QA Verification Dashboard
#### QA Release Board (`/dashboard/quality/qa-releases`)
- **Pending Items**: Materials/batches awaiting QA review
- **QC Results Summary**: Test results and compliance status
- **Decision Matrix**: Release/Hold/Reject options

#### QA Verification Screen (`/dashboard/quality/qa-releases/[id]`)
```typescript
interface QAReleaseForm {
  entityType: 'ReceiptItem' | 'Batch';
  entityId: string;
  decision: 'Release' | 'Reject' | 'Hold';
  remarks: string;          // Required for Hold/Reject
  checklistItems: ChecklistItem[];
  eSignature: string;      // Electronic signature
}

interface ChecklistItem {
  item: string;            // Checklist item description
  checked: boolean;        // Completion status
  remarks?: string;        // Item-specific notes
}
```

#### QA Workflow
1. **QC Results Review**: Analyze all test results
2. **Checklist Verification**: Complete QA checklist
3. **Decision Making**: Release/Hold/Reject with reasoning
4. **Electronic Signature**: Secure approval process
5. **Warehouse Notification**: Auto-notify for putaway

### 6.2 Deviation Management
#### Deviation Tracker (`/dashboard/quality/deviations`)
- **Deviation Log**: All quality deviations
- **CAPA Management**: Corrective and Preventive Actions
- **Root Cause Analysis**: Investigation documentation
- **Resolution Tracking**: Status and timeline

---

## Phase 7: Manufacturing Module
### 7.1 Bill of Materials (BOM) Management
#### BOM List Screen (`/dashboard/manufacturing/boms`)
- **BOM Versions**: Version control for recipe changes
- **Drug Association**: Link BOMs to specific drugs
- **Status Management**: Draft, Active, Obsolete

#### BOM Builder Screen (`/dashboard/manufacturing/boms/new`)
```typescript
interface BOMForm {
  drugId: string;           // Target drug
  version: number;          // Auto-increment
  status: 'Draft' | 'Active' | 'Obsolete';
  items: BOMItem[];         // Raw material requirements
}

interface BOMItem {
  materialId: string;       // Raw material
  quantityPerBatch: number; // Required quantity
  unitId: string;          // Unit of measure
  tolerance: number;       // Allowed variance %
}
```

### 7.2 Work Order Management
#### Work Order Planner (`/dashboard/manufacturing/work-orders`)
- **Production Planning**: Calendar view of planned orders
- **Resource Allocation**: Equipment and personnel assignment
- **Timeline Management**: Start/end date planning

#### Work Order Form
```typescript
interface WorkOrderForm {
  drugId: string;           // Product to manufacture
  siteId: string;          // Production facility
  plannedQuantity: number;  // Target quantity
  unitId: string;          // Unit of measure
  plannedStartDate: Date;   // Production start
  plannedEndDate: Date;     // Production end
  bomVersion: number;      // BOM version to use
}
```

### 7.3 Batch Management & EBR
#### Batch Execution Screen (`/dashboard/manufacturing/batches`)
- **Active Batches**: Currently in production
- **Batch Status**: In-Process, QC Pending, QA Pending, Completed
- **Material Consumption**: Scan and consume raw materials

#### Electronic Batch Record (EBR)
```typescript
interface BatchStep {
  stepNumber: number;       // Sequential step
  instruction: string;      // Step description
  parameters: Record<string, any>; // Step parameters
  performedBy: string;      // User ID
  performedAt: Date;        // Timestamp
  eSignature: string;       // Electronic signature
}
```

#### Batch Workflow
1. **Batch Creation**: From work order
2. **Material Consumption**: Scan and consume materials per BOM
3. **Step Execution**: Complete manufacturing steps
4. **Electronic Signatures**: Secure step completion
5. **QC Submission**: Send completed batch to QC
6. **QA Release**: Final approval for packaging

---

## Phase 8: Warehouse Operations
### 8.1 Inventory Management
#### Stock Browser (`/dashboard/warehouse/inventory`)
- **FEFO Display**: First Expired First Out sorting
- **Location Mapping**: Visual storage location layout
- **Quantity Tracking**: Real-time stock levels
- **Status Filtering**: Available, Quarantine, Hold, Rejected

#### Putaway Management (`/dashboard/warehouse/putaway`)
- **Pending Putaway**: QA-released items awaiting storage
- **Location Assignment**: Assign storage locations
- **Temperature Compliance**: Verify storage conditions

### 8.2 Stock Movement Tracking
#### Movement History (`/dashboard/warehouse/movements`)
- **Movement Types**: Receipt, Transfer, Consumption, Shipment
- **Traceability**: Complete lot history
- **Location Changes**: From/To location tracking

#### Cycle Count Management
- **Count Scheduling**: Regular inventory counts
- **Variance Reporting**: Count vs system discrepancies
- **Adjustment Processing**: Stock level corrections

---

## Phase 9: Distribution & Sales
### 9.1 Sales Order Management
#### Order Entry Screen (`/dashboard/sales/orders`)
```typescript
interface SalesOrderForm {
  accountId: string;        // Customer account
  siteId: string;          // Shipping location
  requestedShipDate: Date; // Delivery requirement
  items: SOItem[];         // Ordered products
  specialInstructions: string; // Delivery notes
}

interface SOItem {
  drugId: string;          // Product selection
  batchPreference: 'FEFO' | 'Specific'; // Allocation preference
  quantity: number;        // Ordered quantity
  unitId: string;          // Unit of measure
  price: number;           // Unit price
}
```

### 9.2 Shipment Management
#### Shipment Dashboard (`/dashboard/distribution/shipments`)
- **Order Allocation**: FEFO-based product allocation
- **Pick List Generation**: Warehouse picking instructions
- **Packaging Instructions**: Special handling requirements
- **Shipping Documentation**: Labels and manifests

#### Cold Chain Monitoring
#### Temperature Tracking (`/dashboard/distribution/cold-chain`)
- **Sensor Readings**: Real-time temperature data
- **Excursion Alerts**: Temperature violations
- **Compliance Reporting**: Chain of custody documentation

#### Proof of Delivery
#### POD Management (`/dashboard/distribution/pod`)
- **Delivery Confirmation**: Customer signature capture
- **Photo Documentation**: Delivery condition photos
- **Exception Handling**: Delivery issues and resolutions

---

## Phase 10: Reporting & Analytics
### 10.1 Executive Dashboards
#### System Overview Dashboard
- **Key Performance Indicators**: OTIF, Quality Metrics, Inventory Turns
- **Trend Analysis**: Historical performance data
- **Alert Management**: System-wide notifications

#### Role-Specific Dashboards
- **Procurement Dashboard**: Supplier performance, cost analysis
- **Production Dashboard**: Batch efficiency, yield analysis
- **Quality Dashboard**: Test results, deviation trends
- **Warehouse Dashboard**: Inventory levels, movement patterns
- **Sales Dashboard**: Order pipeline, customer analysis

### 10.2 Report Generation
#### Export Capabilities
- **CSV Exports**: Data export for external analysis
- **PDF Reports**: Formatted reports for printing
- **Scheduled Reports**: Automated report generation
- **Custom Queries**: Ad-hoc reporting capabilities

#### Audit Trail Management
#### Audit Explorer (`/dashboard/audit`)
- **User Activity**: Login/logout, data changes
- **Data Modifications**: Before/after value tracking
- **System Events**: Automated process logging
- **Compliance Reporting**: Regulatory audit support

---

## API Integration Patterns

### Standard API Response Format
```typescript
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Handling
- **Form Validation**: Real-time field validation
- **API Errors**: User-friendly error messages
- **Network Issues**: Offline capability indicators
- **Permission Errors**: Access denied notifications

### Loading States
- **Button Loading**: Spinner on action buttons
- **Page Loading**: Skeleton screens for data loading
- **Progress Indicators**: Multi-step process progress
- **Optimistic Updates**: Immediate UI updates with rollback

---

## Security & Compliance

### Data Protection
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Token-based protection
- **Role-Based Access**: UI element visibility control
- **Audit Logging**: All user actions tracked

### Pharmaceutical Compliance
- **21 CFR Part 11**: Electronic signature compliance
- **GDP**: Good Distribution Practice guidelines
- **Traceability**: Complete product lifecycle tracking
- **Data Integrity**: Immutable audit trails

---

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Form validation testing
- API integration testing

### Integration Testing
- End-to-end user workflows
- Cross-browser compatibility
- Mobile responsiveness

### User Acceptance Testing
- Role-based scenario testing
- Performance testing with large datasets
- Accessibility compliance testing

---

This comprehensive frontend development plan provides a clear roadmap for implementing the Ziauddin Hospital Pharma System with proper user flows, screen definitions, and API interactions. Each phase builds upon the previous one, ensuring a systematic approach to production deployment.

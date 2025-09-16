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

## Phase 11: Critical Bug Fixes & Form/Table Actions
### 11.1 Form Action Fixes
#### Universal Form Issues
- **Form Validation**: Implement real-time validation across all forms
- **Error Handling**: Standardize error messages and display mechanisms
- **Loading States**: Add proper loading indicators for all form submissions
- **Success Feedback**: Implement consistent success notifications
- **Form Reset**: Ensure forms reset properly after successful submission

#### Specific Form Fixes by Module
- **User Management Forms**:
  - Fix user creation/editing form validation
  - Implement proper role assignment functionality
  - Fix permission matrix updates
  - Add password strength validation

- **Product Management Forms**:
  - Fix product creation/editing with proper validation
  - Implement category selection dropdown
  - Add vendor selection with search
  - Fix SKU validation and uniqueness checks

- **Category Management Forms**:
  - Fix category creation/editing validation
  - Implement parent category selection
  - Add category hierarchy validation

- **Vendor Management Forms**:
  - Fix vendor creation/editing with contact validation
  - Implement address validation
  - Add email format validation
  - Fix phone number format validation

- **Drug Management Forms**:
  - Fix drug creation/editing with chemical formula validation
  - Implement dosage form selection
  - Add strength validation
  - Fix approval status workflow

- **Raw Materials Forms**:
  - Fix material creation/editing validation
  - Implement grade specification validation
  - Add unit of measure selection
  - Fix supplier association

- **Purchase Order Forms**:
  - Fix PO creation with item validation
  - Implement supplier selection with search
  - Add quantity and price validation
  - Fix approval workflow integration

- **Quality Control Forms**:
  - Fix sample request creation
  - Implement test result entry validation
  - Add specification compliance checking
  - Fix QA release workflow

- **Manufacturing Forms**:
  - Fix BOM creation with item validation
  - Implement work order creation
  - Add batch execution forms
  - Fix material consumption tracking

- **Warehouse Forms**:
  - Fix inventory movement forms
  - Implement putaway assignment
  - Add cycle count forms
  - Fix location assignment

### 11.2 Table Action Fixes
#### Universal Table Issues
- **Action Buttons**: Fix all view, edit, delete action buttons
- **Bulk Actions**: Implement bulk operations (select all, bulk delete, bulk update)
- **Row Selection**: Fix single and multiple row selection
- **Action Confirmation**: Add confirmation dialogs for destructive actions
- **Action Loading**: Implement loading states for all table actions

#### Specific Table Action Fixes
- **Data Table Component**:
  - Fix generic data table action handlers
  - Implement proper action button rendering
  - Add action permission checks
  - Fix pagination with actions

- **User Management Tables**:
  - Fix user list view/edit/delete actions
  - Implement bulk user operations
  - Add user status toggle actions
  - Fix role assignment actions

- **Product Management Tables**:
  - Fix product list CRUD actions
  - Implement bulk product operations
  - Add product status management
  - Fix category assignment actions

- **Category Management Tables**:
  - Fix category list CRUD actions
  - Implement category hierarchy actions
  - Add bulk category operations
  - Fix category activation/deactivation

- **Vendor Management Tables**:
  - Fix vendor list CRUD actions
  - Implement vendor status management
  - Add bulk vendor operations
  - Fix vendor contact management

- **Drug Management Tables**:
  - Fix drug list CRUD actions
  - Implement approval workflow actions
  - Add bulk drug operations
  - Fix drug status management

- **Procurement Tables**:
  - Fix PO list CRUD actions
  - Implement PO approval actions
  - Add GRN creation actions
  - Fix supplier performance tracking

- **Quality Control Tables**:
  - Fix sample list actions
  - Implement test result entry actions
  - Add QA release actions
  - Fix deviation management actions

- **Manufacturing Tables**:
  - Fix BOM list CRUD actions
  - Implement work order actions
  - Add batch execution actions
  - Fix material consumption actions

- **Warehouse Tables**:
  - Fix inventory list actions
  - Implement movement tracking actions
  - Add putaway actions
  - Fix cycle count actions

### 11.3 API Integration Fixes
#### Standardize API Responses
- **Error Handling**: Implement consistent error response handling
- **Loading States**: Add proper loading state management
- **Success Responses**: Standardize success response handling
- **Validation Errors**: Implement field-specific validation error display

#### Fix API Service Methods
- **CRUD Operations**: Fix all create, read, update, delete operations
- **Search & Filter**: Implement proper search and filtering
- **Pagination**: Fix pagination across all modules
- **Bulk Operations**: Implement bulk API operations

### 11.4 UI/UX Improvements
#### Form Improvements
- **Field Validation**: Add real-time field validation
- **Error Display**: Implement inline error messages
- **Success Feedback**: Add success notifications
- **Form Reset**: Implement proper form reset functionality

#### Table Improvements
- **Action Buttons**: Fix all action button functionality
- **Row Selection**: Implement proper row selection
- **Bulk Actions**: Add bulk operation capabilities
- **Action Confirmation**: Implement confirmation dialogs

---

## Phase 12: Missing Pages Implementation
### 12.1 Identity & Authentication Pages
#### Roles Management (`/dashboard/roles`)
- **Role List Screen**: Display all system roles with permissions
- **Role Form**: Create/edit roles with permission assignment
- **Permission Matrix**: Visual permission assignment interface
- **Role Hierarchy**: Define role hierarchy and inheritance

#### Permissions Management (`/dashboard/permissions`)
- **Permission List**: Display all system permissions
- **Permission Groups**: Organize permissions by modules
- **Permission Assignment**: Assign permissions to roles
- **Permission Audit**: Track permission changes and usage

#### Refresh Tokens Management (`/dashboard/refresh-tokens`)
- **Token List**: Display active refresh tokens
- **Token Management**: Revoke/regenerate tokens
- **Token Security**: Monitor token usage and security
- **Token Audit**: Track token creation and revocation

### 12.2 Master Data Pages
#### Distributors Management (`/dashboard/distributors`)
- **Distributor List**: Display all distributors with performance metrics
- **Distributor Form**: Create/edit distributor information
- **Performance Dashboard**: Track distributor performance
- **Contract Management**: Manage distributor contracts

#### Sites Management (`/dashboard/sites`)
- **Site List**: Display all company sites and facilities
- **Site Form**: Create/edit site information
- **Site Hierarchy**: Define site relationships
- **Site Configuration**: Configure site-specific settings

#### Storage Locations (`/dashboard/storage-locations`)
- **Location List**: Display all storage locations
- **Location Form**: Create/edit storage locations
- **Location Mapping**: Visual location layout
- **Temperature Zones**: Define temperature-controlled areas

#### Equipment Management (`/dashboard/equipment`)
- **Equipment List**: Display all manufacturing equipment
- **Equipment Form**: Create/edit equipment information
- **Maintenance Schedule**: Track equipment maintenance
- **Calibration Records**: Manage equipment calibration

#### Units of Measure (`/dashboard/units`)
- **Unit List**: Display all units of measure
- **Unit Form**: Create/edit units with conversions
- **Unit Categories**: Organize units by type
- **Conversion Matrix**: Define unit conversions

### 12.3 Procurement Pages
#### Certificate of Analysis (`/dashboard/procurement/coa`)
- **CoA List**: Display all certificates of analysis
- **CoA Upload**: Upload and manage CoA documents
- **CoA Validation**: Validate CoA against specifications
- **CoA Tracking**: Track CoA status and expiration

### 12.4 Manufacturing Pages
#### Batch Consumptions (`/dashboard/manufacturing/consumptions`)
- **Consumption List**: Display material consumption records
- **Consumption Form**: Record material consumption
- **Batch Tracking**: Track consumption by batch
- **Variance Analysis**: Analyze consumption variances

#### Electronic Batch Records (`/dashboard/manufacturing/ebr`)
- **EBR List**: Display all electronic batch records
- **EBR Form**: Create/edit batch records
- **Step Execution**: Execute manufacturing steps
- **Digital Signatures**: Implement electronic signatures

### 12.5 Warehouse Pages
#### Storage Locations (`/dashboard/warehouse/locations`)
- **Location List**: Display warehouse storage locations
- **Location Form**: Create/edit storage locations
- **Location Status**: Track location availability
- **Location Assignment**: Assign items to locations

#### Temperature Logs (`/dashboard/warehouse/temperature`)
- **Temperature Dashboard**: Real-time temperature monitoring
- **Temperature History**: Historical temperature data
- **Alert Management**: Temperature excursion alerts
- **Compliance Reporting**: Temperature compliance reports

#### Labels & Barcodes (`/dashboard/warehouse/labels`)
- **Label Generator**: Generate product labels and barcodes
- **Label Templates**: Manage label templates
- **Barcode Scanner**: Integration with barcode scanners
- **Label History**: Track label printing history

### 12.6 Distribution Pages
#### Shipment Items (`/dashboard/distribution/shipment-items`)
- **Item List**: Display all shipment items
- **Item Form**: Create/edit shipment items
- **Item Tracking**: Track item status in shipment
- **Item Validation**: Validate items against orders

### 12.7 Sales/CRM Pages
#### Accounts Management (`/dashboard/sales/accounts`)
- **Account List**: Display all customer accounts
- **Account Form**: Create/edit customer accounts
- **Account Hierarchy**: Define account relationships
- **Account Performance**: Track account performance

#### Activities Management (`/dashboard/sales/activities`)
- **Activity List**: Display all sales activities
- **Activity Form**: Create/edit activities
- **Activity Calendar**: Calendar view of activities
- **Activity Tracking**: Track activity completion

#### Contracts Management (`/dashboard/sales/contracts`)
- **Contract List**: Display all sales contracts
- **Contract Form**: Create/edit contracts
- **Contract Terms**: Manage contract terms and conditions
- **Contract Renewal**: Track contract renewals

#### Point of Sale (`/dashboard/sales/pos`)
- **POS Dashboard**: Real-time POS operations
- **Transaction List**: Display all POS transactions
- **Payment Processing**: Process payments
- **Receipt Management**: Generate and manage receipts

### 12.8 Regulatory & Documents Pages
#### Documents Management (`/dashboard/regulatory/documents`)
- **Document List**: Display all regulatory documents
- **Document Upload**: Upload and manage documents
- **Document Categories**: Organize documents by type
- **Document Versioning**: Manage document versions

#### Document Approvals (`/dashboard/regulatory/approvals`)
- **Approval Queue**: Display pending approvals
- **Approval Form**: Process document approvals
- **Approval Workflow**: Define approval workflows
- **Approval History**: Track approval history

#### Training Records (`/dashboard/regulatory/training`)
- **Training List**: Display all training records
- **Training Form**: Create/edit training records
- **Training Schedule**: Manage training schedules
- **Certification Tracking**: Track certifications and renewals

### 12.9 Reporting & Analytics Pages
#### Exports Management (`/dashboard/reports/exports`)
- **Export List**: Display all data exports
- **Export Generator**: Generate custom exports
- **Export Templates**: Manage export templates
- **Export History**: Track export history

#### Scheduled Reports (`/dashboard/reports/scheduled`)
- **Schedule List**: Display scheduled reports
- **Schedule Form**: Create/edit report schedules
- **Report Templates**: Manage report templates
- **Delivery Management**: Manage report delivery

#### Recall Coverage (`/dashboard/reports/recall`)
- **Recall List**: Display product recalls
- **Recall Form**: Create/edit recall records
- **Coverage Analysis**: Analyze recall coverage
- **Compliance Tracking**: Track recall compliance

### 12.10 Page Implementation Standards
#### Common Page Structure
- **List View**: Data table with search, filter, and pagination
- **Form View**: Create/edit forms with validation
- **Detail View**: Read-only detail pages
- **Action Buttons**: Standard CRUD operations

#### Navigation Integration
- **Sidebar Integration**: Add all pages to sidebar navigation
- **Breadcrumb Navigation**: Implement breadcrumb navigation
- **Page Permissions**: Implement page-level permissions
- **Role-based Access**: Show/hide pages based on user role

#### API Integration
- **RESTful APIs**: Implement standard REST endpoints
- **Error Handling**: Consistent error handling across pages
- **Loading States**: Implement loading states
- **Success Feedback**: Provide user feedback for actions

---

## Phase 13: Permission-Based Module & Action Visibility
### 13.1 Enhanced Permission System
#### Permission Structure Redesign
```typescript
interface PermissionSystem {
  modules: {
    [moduleName: string]: {
      screens: {
        [screenName: string]: {
          actions: {
            view: boolean;
            create: boolean;
            edit: boolean;
            delete: boolean;
            approve?: boolean;
            reject?: boolean;
            export?: boolean;
            import?: boolean;
          };
          fields?: {
            [fieldName: string]: boolean;
          };
        };
      };
    };
  };
}
```

#### Role-Based Module Access
- **System Admin**: Full access to all modules and actions
- **Org Admin**: Access to organizational modules with limited system functions
- **Module Managers**: Access to specific modules with full permissions
- **Operators**: Limited access to assigned modules and actions
- **Viewers**: Read-only access to assigned modules

### 13.2 Dynamic Sidebar Navigation
#### Permission-Based Menu Generation
- **Module Visibility**: Show/hide entire modules based on permissions
- **Screen Visibility**: Show/hide screens within modules
- **Action Visibility**: Show/hide action buttons based on permissions
- **Hierarchical Access**: Implement permission inheritance

#### Navigation Implementation
```typescript
interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: {
    module: string;
    screen: string;
    action: string;
  };
  children?: NavigationItem[];
  visible: boolean; // Computed based on permissions
}
```

### 13.3 Module-Specific Permissions
#### Identity & Authentication Module
- **Users Management**:
  - View: `identity.users.view`
  - Create: `identity.users.create`
  - Edit: `identity.users.edit`
  - Delete: `identity.users.delete`
  - Reset Password: `identity.users.reset_password`

- **Roles Management**:
  - View: `identity.roles.view`
  - Create: `identity.roles.create`
  - Edit: `identity.roles.edit`
  - Delete: `identity.roles.delete`
  - Assign Permissions: `identity.roles.assign_permissions`

- **Permissions Management**:
  - View: `identity.permissions.view`
  - Create: `identity.permissions.create`
  - Edit: `identity.permissions.edit`
  - Delete: `identity.permissions.delete`

#### Master Data Module
- **Drugs Management**:
  - View: `master.drugs.view`
  - Create: `master.drugs.create`
  - Edit: `master.drugs.edit`
  - Delete: `master.drugs.delete`
  - Approve: `master.drugs.approve`
  - Reject: `master.drugs.reject`

- **Raw Materials Management**:
  - View: `master.raw_materials.view`
  - Create: `master.raw_materials.create`
  - Edit: `master.raw_materials.edit`
  - Delete: `master.raw_materials.delete`
  - Import: `master.raw_materials.import`

- **Suppliers Management**:
  - View: `master.suppliers.view`
  - Create: `master.suppliers.create`
  - Edit: `master.suppliers.edit`
  - Delete: `master.suppliers.delete`
  - Rate: `master.suppliers.rate`

#### Procurement Module
- **Purchase Orders**:
  - View: `procurement.purchase_orders.view`
  - Create: `procurement.purchase_orders.create`
  - Edit: `procurement.purchase_orders.edit`
  - Delete: `procurement.purchase_orders.delete`
  - Approve: `procurement.purchase_orders.approve`
  - Reject: `procurement.purchase_orders.reject`

- **Goods Receipts**:
  - View: `procurement.goods_receipts.view`
  - Create: `procurement.goods_receipts.create`
  - Edit: `procurement.goods_receipts.edit`
  - Delete: `procurement.goods_receipts.delete`
  - Verify: `procurement.goods_receipts.verify`

#### Manufacturing Module
- **Bill of Materials**:
  - View: `manufacturing.boms.view`
  - Create: `manufacturing.boms.create`
  - Edit: `manufacturing.boms.edit`
  - Delete: `manufacturing.boms.delete`
  - Version: `manufacturing.boms.version`

- **Work Orders**:
  - View: `manufacturing.work_orders.view`
  - Create: `manufacturing.work_orders.create`
  - Edit: `manufacturing.work_orders.edit`
  - Delete: `manufacturing.work_orders.delete`
  - Start: `manufacturing.work_orders.start`
  - Complete: `manufacturing.work_orders.complete`

- **Batches**:
  - View: `manufacturing.batches.view`
  - Create: `manufacturing.batches.create`
  - Edit: `manufacturing.batches.edit`
  - Delete: `manufacturing.batches.delete`
  - Execute: `manufacturing.batches.execute`
  - Release: `manufacturing.batches.release`

#### Quality Control Module
- **QC Tests**:
  - View: `quality.qc_tests.view`
  - Create: `quality.qc_tests.create`
  - Edit: `quality.qc_tests.edit`
  - Delete: `quality.qc_tests.delete`
  - Execute: `quality.qc_tests.execute`

- **Sample Results**:
  - View: `quality.sample_results.view`
  - Create: `quality.sample_results.create`
  - Edit: `quality.sample_results.edit`
  - Delete: `quality.sample_results.delete`
  - Approve: `quality.sample_results.approve`

#### Quality Assurance Module
- **QA Releases**:
  - View: `quality.qa_releases.view`
  - Create: `quality.qa_releases.create`
  - Edit: `quality.qa_releases.edit`
  - Delete: `quality.qa_releases.delete`
  - Approve: `quality.qa_releases.approve`
  - Reject: `quality.qa_releases.reject`

- **Deviations**:
  - View: `quality.deviations.view`
  - Create: `quality.deviations.create`
  - Edit: `quality.deviations.edit`
  - Delete: `quality.deviations.delete`
  - Investigate: `quality.deviations.investigate`
  - Close: `quality.deviations.close`

#### Warehouse Module
- **Inventory Management**:
  - View: `warehouse.inventory.view`
  - Create: `warehouse.inventory.create`
  - Edit: `warehouse.inventory.edit`
  - Delete: `warehouse.inventory.delete`
  - Move: `warehouse.inventory.move`
  - Adjust: `warehouse.inventory.adjust`

- **Stock Movements**:
  - View: `warehouse.movements.view`
  - Create: `warehouse.movements.create`
  - Edit: `warehouse.movements.edit`
  - Delete: `warehouse.movements.delete`
  - Reverse: `warehouse.movements.reverse`

#### Distribution Module
- **Sales Orders**:
  - View: `distribution.sales_orders.view`
  - Create: `distribution.sales_orders.create`
  - Edit: `distribution.sales_orders.edit`
  - Delete: `distribution.sales_orders.delete`
  - Process: `distribution.sales_orders.process`

- **Shipments**:
  - View: `distribution.shipments.view`
  - Create: `distribution.shipments.create`
  - Edit: `distribution.shipments.edit`
  - Delete: `distribution.shipments.delete`
  - Ship: `distribution.shipments.ship`
  - Track: `distribution.shipments.track`

### 13.4 Field-Level Permissions
#### Sensitive Data Protection
- **Financial Data**: Price, cost, margin fields
- **Personal Data**: User contact information
- **Confidential Data**: Trade secrets, formulas
- **Regulatory Data**: Compliance information

#### Field Permission Implementation
```typescript
interface FieldPermissions {
  [fieldName: string]: {
    view: boolean;
    edit: boolean;
    required: boolean;
  };
}
```

### 13.5 Action-Based UI Components
#### Permission-Aware Components
- **ActionButton**: Only render if user has permission
- **FormField**: Show/hide fields based on permissions
- **DataTable**: Show/hide columns based on permissions
- **NavigationItem**: Show/hide menu items based on permissions

#### Component Implementation
```typescript
interface PermissionAwareProps {
  module: string;
  screen: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### 13.6 Permission Management Interface
#### Role Permission Matrix
- **Visual Matrix**: Grid showing role vs permission assignments
- **Bulk Assignment**: Assign multiple permissions at once
- **Permission Inheritance**: Define permission inheritance rules
- **Permission Audit**: Track permission changes

#### User Permission Override
- **Individual Overrides**: Override role permissions for specific users
- **Temporary Permissions**: Time-limited permission grants
- **Emergency Access**: Emergency permission escalation
- **Permission History**: Track all permission changes

### 13.7 Security Implementation
#### Permission Validation
- **Frontend Validation**: Client-side permission checks
- **Backend Validation**: Server-side permission verification
- **API Security**: Secure API endpoints with permission checks
- **Route Protection**: Protect routes based on permissions

#### Audit & Compliance
- **Permission Logging**: Log all permission checks
- **Access Auditing**: Track user access patterns
- **Compliance Reporting**: Generate permission compliance reports
- **Security Monitoring**: Monitor for permission violations

### 13.8 Performance Optimization
#### Permission Caching
- **Client-Side Caching**: Cache permissions in browser
- **Server-Side Caching**: Cache permissions on server
- **Permission Preloading**: Preload permissions for better performance
- **Lazy Loading**: Load permissions as needed

#### UI Optimization
- **Conditional Rendering**: Only render components when needed
- **Permission Bundling**: Group related permissions
- **Efficient Checks**: Optimize permission checking algorithms
- **Memory Management**: Manage permission data efficiently



---
## Phase 14: Updating UI
-in all pages of all modules we have table with search and files card. the filters should be with table search. in case we have more filters then show filter icon on click of show filter on dropdown.
-there is no option for organization on login
-sites will show on header so admin can change and see diffrent sites data
-in case of site manager. it can change only the assign store. 
-in sales order we have so many cards. make it nicely.

---
## Phase 15: Connecting modules
This overview outlines the core flows in pharmaceutical manufacturing and distribution, spanning procurement, supplier management, warehousing, quality control, manufacturing, sales, and distribution.

The process begins with procurement creating and approving purchase orders, which are sent to suppliers for fulfillment. Suppliers ship materials to the warehouse, where goods are received, verified, and stored. Quality control samples are taken upon receipt, with QC and QA teams conducting tests and making release decisions. Only released materials are made available for production.

Manufacturing uses released materials to produce finished goods, which undergo further QC and QA before being stored as available inventory. Sales orders are created and approved based on available stock, triggering distribution activities such as shipment planning, stock allocation, and delivery to customers. Throughout, invoicing and proof of delivery ensure completion of the sales and distribution cycle.

This end-to-end flow ensures regulatory compliance, product quality, and efficient fulfillment in the pharmaceutical supply chain.

----
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

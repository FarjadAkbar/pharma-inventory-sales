Ziauddin Hospital — Pharma System
Entity Relationship Diagram (ERD) & Design Specification — Final Handoff
1. Introduction
This document is the final, complete handoff for the Ziauddin Hospital Pharmaceutical System. It includes ERD table definitions, relationships, role-wise access and CRUD matrices, detailed API contracts, SQL schema snippets, workflows, validation rules, UI design notes (light/dark theme tokens), and acceptance criteria. All abbreviations are expanded (e.g., PO = Purchase Order, GRN = Goods Receipt Note, QC = Quality Control, QA = Quality Assurance, EBR = Electronic Batch Record, FEFO = First Expired First Out).
2. User Roles
·         - System Administrator
·         - Organization Administrator
·         - Procurement Manager
·         - Production Manager
·         - Quality Control Manager / Analyst
·         - Quality Assurance Manager
·         - Warehouse Operations
·         - Distribution Operations
·         - Sales Representative
·         - Auditor
3. Modules (Overview)
Identity & Authentication
·         - Users
·         - Roles
·         - Permissions
·         - Refresh Tokens
·         - Audit Logs
Master Data
·         - Drugs
·         - Raw Materials
·         - Suppliers
·         - Distributors
·         - Sites
·         - Storage Locations
·         - Equipment
·         - Units of Measure
Procurement
·         - Purchase Orders
·         - Goods Receipts
·         - Certificate of Analysis (CoA) attachments
Manufacturing
·         - Bill of Materials (BOMs)
·         - Work Orders
·         - Batches
·         - Batch Consumptions
·         - Electronic Batch Records (EBR)
Quality (QC/QA)
·         - Quality Control Tests
·         - Sample Requests
·         - Sample Results
·         - Quality Assurance Releases
·         - Deviations / CAPA
Warehouse
·         - Inventory Lots
·         - Stock Movements
·         - Storage Locations
·         - Temperature Logs
·         - Cycle Counts
·         - Labels & Barcodes
Distribution
·         - Sales Orders
·         - Shipments
·         - Shipment Items
·         - Cold Chain Sensors & Readings
·         - Proof of Delivery
Sales / CRM
·         - Accounts
·         - Activities
·         - Contracts
·         - Point of Sale (POS)
Regulatory & Documents
·         - Documents
·         - Document Approvals
·         - Training Records
Reporting & Analytics
·         - Dashboards
·         - Exports
·         - Scheduled Reports
·         - Recall Coverage
4. ERD — Core Tables & Fields (Full Forms)
organizations
Column
Type/Constraint
id
UUID PK
name
TEXT
timezone
TEXT
created_at
TIMESTAMPTZ

users
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
email
CITEXT UNIQUE
password_hash
TEXT
full_name
TEXT
twofa_enabled
BOOLEAN
status
TEXT DEFAULT 'Active'
created_at
TIMESTAMPTZ

roles
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
name
TEXT

user_roles
Column
Type/Constraint
user_id
UUID FK users.id
role_id
UUID FK roles.id

permissions
Column
Type/Constraint
id
UUID PK
key
TEXT UNIQUE

role_permissions
Column
Type/Constraint
role_id
UUID FK roles.id
permission_id
UUID FK permissions.id

audit_logs
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
user_id
UUID FK users.id
action
TEXT
entity
TEXT
entity_id
UUID
before
JSONB
after
JSONB
ip
INET
user_agent
TEXT
created_at
TIMESTAMPTZ

units
Column
Type/Constraint
id
UUID PK
code
TEXT UNIQUE
name
TEXT

drugs
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
code
TEXT
name
TEXT
formula
TEXT
strength
TEXT
dosage_form
TEXT
route
TEXT
description
TEXT
approval_status
TEXT DEFAULT 'Draft'
created_at
TIMESTAMPTZ

raw_materials
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
code
TEXT
name
TEXT
grade
TEXT
unit_id
UUID FK units.id
description
TEXT

suppliers
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
code
TEXT
name
TEXT
contact
JSONB
address
TEXT
approved
BOOLEAN
rating
INTEGER

distributors
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
code
TEXT
name
TEXT
contact
JSONB
address
TEXT
license_no
TEXT

sites
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
code
TEXT
name
TEXT
type
TEXT
address
TEXT

storage_locations
Column
Type/Constraint
id
UUID PK
site_id
UUID FK sites.id
code
TEXT
type
TEXT
temp_min
NUMERIC
temp_max
NUMERIC
capacity
NUMERIC

equipment
Column
Type/Constraint
id
UUID PK
site_id
UUID FK sites.id
code
TEXT
name
TEXT
calibration_due_at
TIMESTAMPTZ
status
TEXT

purchase_orders
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
supplier_id
UUID FK suppliers.id
site_id
UUID FK sites.id
status
TEXT
expected_date
DATE

po_items
Column
Type/Constraint
id
UUID PK
po_id
UUID FK purchase_orders.id
material_id
UUID FK raw_materials.id
qty
NUMERIC
unit_id
UUID FK units.id
unit_price
NUMERIC

goods_receipts
Column
Type/Constraint
id
UUID PK
po_id
UUID FK purchase_orders.id
received_at
TIMESTAMPTZ
received_by
UUID FK users.id
status
TEXT

goods_receipt_items
Column
Type/Constraint
id
UUID PK
goods_receipt_id
UUID FK goods_receipts.id
material_id
UUID FK raw_materials.id
qty
NUMERIC
batch_no
TEXT
coa_file_id
UUID

boms
Column
Type/Constraint
id
UUID PK
drug_id
UUID FK drugs.id
version
INTEGER
status
TEXT

bom_items
Column
Type/Constraint
id
UUID PK
bom_id
UUID FK boms.id
material_id
UUID FK raw_materials.id
qty_per_batch
NUMERIC
unit_id
UUID FK units.id

work_orders
Column
Type/Constraint
id
UUID PK
drug_id
UUID FK drugs.id
site_id
UUID FK sites.id
planned_qty
NUMERIC
unit_id
UUID FK units.id
status
TEXT

batches
Column
Type/Constraint
id
UUID PK
work_order_id
UUID FK work_orders.id
batch_no
TEXT
manufactured_at
DATE
expiry_date
DATE
status
TEXT

batch_consumptions
Column
Type/Constraint
id
UUID PK
batch_id
UUID FK batches.id
material_id
UUID FK raw_materials.id
material_batch_no
TEXT
qty
NUMERIC
unit_id
UUID FK units.id
source_receipt_item_id
UUID FK goods_receipt_items.id

batch_steps
Column
Type/Constraint
id
UUID PK
batch_id
UUID FK batches.id
step_no
INTEGER
instruction
TEXT
performed_by
UUID FK users.id
performed_at
TIMESTAMPTZ
parameters
JSONB
e_signature_by
UUID FK users.id

qc_tests
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
name
TEXT
method
TEXT
spec
JSONB
unit_id
UUID FK units.id

sample_requests
Column
Type/Constraint
id
UUID PK
source_type
TEXT CHECK in ('Receipt','Batch')
source_id
UUID
requested_at
TIMESTAMPTZ
due_at
TIMESTAMPTZ
status
TEXT

sample_results
Column
Type/Constraint
id
UUID PK
sample_request_id
UUID FK sample_requests.id
test_id
UUID FK qc_tests.id
result_value
TEXT
unit_id
UUID FK units.id
passed
BOOLEAN
analyst_id
UUID FK users.id
performed_at
TIMESTAMPTZ
attachment_id
UUID

qa_releases
Column
Type/Constraint
id
UUID PK
entity_type
TEXT CHECK in ('ReceiptItem','Batch')
entity_id
UUID
decision
TEXT CHECK in ('Release','Reject','Hold')
remarks
TEXT
released_by
UUID FK users.id
released_at
TIMESTAMPTZ
e_signature_by
UUID FK users.id

inventory_lots
Column
Type/Constraint
id
UUID PK
entity_type
TEXT CHECK in ('Material','Finished')
entity_id
UUID
lot_no
TEXT
qty
NUMERIC
unit_id
UUID FK units.id
status
TEXT
site_id
UUID FK sites.id
location_id
UUID FK storage_locations.id

stock_movements
Column
Type/Constraint
id
UUID PK
lot_id
UUID FK inventory_lots.id
from_location_id
UUID FK storage_locations.id
to_location_id
UUID FK storage_locations.id
qty
NUMERIC
reason
TEXT
ref_type
TEXT
ref_id
UUID
moved_at
TIMESTAMPTZ
moved_by
UUID FK users.id

accounts
Column
Type/Constraint
id
UUID PK
org_id
UUID FK organizations.id
type
TEXT CHECK in ('Distributor','Hospital','Pharmacy')
name
TEXT
contact
JSONB
license_no
TEXT

sales_orders
Column
Type/Constraint
id
UUID PK
account_id
UUID FK accounts.id
site_id
UUID FK sites.id
status
TEXT
requested_ship_date
DATE

so_items
Column
Type/Constraint
id
UUID PK
so_id
UUID FK sales_orders.id
drug_id
UUID FK drugs.id
batch_preference
TEXT
qty
NUMERIC
unit_id
UUID FK units.id
price
NUMERIC

shipments
Column
Type/Constraint
id
UUID PK
so_id
UUID FK sales_orders.id
shipped_at
TIMESTAMPTZ
carrier
TEXT
tracking_no
TEXT
status
TEXT

shipment_items
Column
Type/Constraint
id
UUID PK
shipment_id
UUID FK shipments.id
inventory_lot_id
UUID FK inventory_lots.id
qty
NUMERIC

cold_chain_sensors
Column
Type/Constraint
id
UUID PK
code
TEXT UNIQUE
description
TEXT

shipment_readings
Column
Type/Constraint
id
UUID PK
sensor_id
UUID FK cold_chain_sensors.id
shipment_id
UUID FK shipments.id
recorded_at
TIMESTAMPTZ
value
NUMERIC

proof_of_delivery
Column
Type/Constraint
id
UUID PK
shipment_id
UUID FK shipments.id
received_by
TEXT
received_at
TIMESTAMPTZ
docs_id
UUID

documents
Column
Type/Constraint
id
UUID PK
code
TEXT UNIQUE
title
TEXT
version
INTEGER
status
TEXT
file_id
UUID

doc_approvals
Column
Type/Constraint
id
UUID PK
document_id
UUID FK documents.id
step_no
INTEGER
approver_id
UUID FK users.id
decision
TEXT
decided_at
TIMESTAMPTZ

training_records
Column
Type/Constraint
id
UUID PK
user_id
UUID FK users.id
document_id
UUID FK documents.id
acknowledged_at
TIMESTAMPTZ

5. Key Relationships
From
To / Cardinality
Supplier (suppliers.id)
Purchase Order (purchase_orders.supplier_id) — 1..N
Purchase Order (purchase_orders.id)
Goods Receipt (goods_receipts.po_id) — 1..N
Goods Receipt -> Items
goods_receipts.id -> goods_receipt_items.goods_receipt_id — 1..N
Drug (drugs.id)
BOM (boms.drug_id) — 1..N
BOM (boms.id)
BOM Items (bom_items.bom_id) — 1..N
Work Order (work_orders.id)
Batch (batches.work_order_id) — 1..N
Batch (batches.id)
Batch Consumptions (batch_consumptions.batch_id) — 1..N
Batch (batches.id)
Batch Steps (batch_steps.batch_id) — 1..N
Receipt/Batch
Sample Requests (sample_requests.source_id) — 1..N
Sample Request
Sample Results (sample_results.sample_request_id) — 1..N
QA Release
Inventory Lots eligibility — Release/Hold/Reject
Inventory Lot
Stock Movements — 1..N
Sales Order
Shipments — 1..N
Shipment
Shipment Items — 1..N
Shipment
Proof Of Delivery — 1..1
Shipment
Cold Chain Sensor Readings — 1..N

6. Role-wise Access & CRUD Matrix
Table / Module
System Admin
Org Admin
Procurement Manager
Production Manager
QC Manager/Analyst
QA Manager
Warehouse Ops
Distribution Ops
Sales Rep
Auditor
organizations
RW
RW
-
-
-
-
-
-
-
R
users
RW
RW
-
-
-
-
-
-
-
R
roles
RW
RW
-
-
-
-
-
-
-
R
permissions
RW
RW
-
-
-
-
-
-
-
R
drugs
RW
RW
R
RW
R
R
-
-
-
R
raw_materials
RW
RW
RW
RW
R
R
-
-
-
R
suppliers
RW
RW
RW
-
-
-
-
-
-
R
purchase_orders
RW
RW
RW
-
-
-
-
-
-
R
goods_receipts
RW
RW
RW
-
-
-
RW
-
-
R
boms
RW
RW
-
RW
-
-
-
-
-
R
work_orders
RW
RW
-
RW
-
-
-
-
-
R
batches
RW
-
-
RW
RW
RW
R
-
-
R
qc_tests
RW
-
-
-
RW
R
-
-
-
R
sample_requests
RW
-
-
-
RW
R
-
-
-
R
sample_results
RW
-
-
-
RW
R
-
-
-
R
qa_releases
RW
-
-
-
R
RW
-
-
-
R
inventory_lots
RW
-
-
-
-
-
RW
R
-
R
stock_movements
RW
-
-
-
-
-
RW
RW
-
R
sales_orders
RW
-
-
-
-
-
-
RW
RW
R
shipments
RW
-
-
-
-
-
RW
RW
-
R
documents
RW
RW
R
R
R
RW
-
-
-
R
audit_logs
RW
R
-
-
-
-
-
-
-
R

Legend: R = Read, W = Write (Create/Update/Delete), RW = Read & Write, '-' = No Access.
7. Per-Role Responsibilities & Screens
System Administrator
·         - Tenant/org provisioning, environment config, feature flags
·         - User/role/permission templates, audit & security policies
·         - Screens: System Settings, Roles & Permissions, Audit Explorer
Organization Administrator
·         - Org-level catalogs, sites, users, approvals routing
·         - Screens: Org Settings, Sites, Users, Master Data dashboard
Procurement Manager
·         - Supplier management, Purchase Order creation/approval, Goods Receipt oversight, CoA management
·         - Screens: Suppliers, Purchase Order Builder, Goods Receipt Note, Supplier Performance
Production Manager
·         - BOM versions, Work Order planning & scheduling, Batch execution & EBR review
·         - Screens: BOMs, Planner (calendar/Gantt), Batch EBR, Exceptions
Quality Control Manager / Analyst
·         - Test library/specs, Sample queue, Results entry, Out-of-spec handling
·         - Screens: QC Tests, Sample Queue, Result Entry, OOS tracker
Quality Assurance Manager
·         - QA releases for receipts/batches, Deviations & CAPA, Document control
·         - Screens: QA Release Board, Deviations/CAPA, Documents & Approvals
Warehouse Operations
·         - Putaway, bin transfers, cycle counts, temperature monitoring, label printing
·         - Screens: Putaway, Stock Browser, Movements, Cycle Count, Temperature Logs, Label Print
Distribution Operations
·         - Order allocation (FEFO), pick/pack/ship, cold chain monitoring, Proof of Delivery
·         - Screens: Order Allocation, Picks, Shipments, Cold Chain, POD Upload
Sales Representative
·         - Accounts/contacts, orders entry, POS (if applicable)
·         - Screens: Accounts, Orders, POS, Activities
Auditor
·         - Read-only access to data, audit logs, document histories
·         - Screens: Read-only dashboards, Audit Trails, Reports
8. API Contracts (REST)
Authentication
Endpoint
Notes / Request → Response
POST /api/auth/login
{ email, password } → { accessToken, refreshToken, user }
POST /api/auth/refresh
{ refreshToken } → { accessToken, refreshToken }
POST /api/auth/logout
Revokes refresh token
GET /api/auth/me
Current user with roles/claims

Master Data
Endpoint
Notes / Request → Response
GET /api/drugs
List with filters (code,name,status,route)
POST /api/drugs
Create
PUT /api/drugs/{id}
Update
DELETE /api/drugs/{id}
Soft delete/deactivate
GET /api/raw-materials
List/search
POST /api/raw-materials
Create/Update

Procurement
Endpoint
Notes / Request → Response
POST /api/purchase-orders
Create PO with items
PUT /api/purchase-orders/{id}/approve
Approve
POST /api/goods-receipts
Create Goods Receipt Note against PO
POST /api/goods-receipts/{id}/samples
Auto-create QC Sample Requests

Manufacturing
Endpoint
Notes / Request → Response
POST /api/work-orders
Plan work order
POST /api/batches
Start batch
POST /api/batches/{id}/consume
Consume materials (scan lot)
POST /api/batches/{id}/complete
Send to QC
POST /api/batch-steps/{id}/sign
Electronic signature

Quality
Endpoint
Notes / Request → Response
POST /api/qc/samples
Create sample request
GET /api/qc/samples?status=
Queue
POST /api/qc/samples/{id}/results
Submit results
POST /api/qa/releases
Release/Reject/Hold entity
POST /api/quality/deviations
Open/Close deviation

Warehouse
Endpoint
Notes / Request → Response
POST /api/warehouse/putaway
Putaway released lots
POST /api/warehouse/move
Bin transfer
GET /api/warehouse/stock
Stock with filters (FEFO)
POST /api/warehouse/cycle-counts
Submit counts

Distribution & Sales
Endpoint
Notes / Request → Response
POST /api/sales-orders
Create SO
POST /api/shipments/pick-pack-ship
Allocate & ship
GET /api/shipments/{id}/cold-chain
Sensor readings
POST /api/shipments/{id}/pod
Upload Proof of Delivery

Documents & Reporting
Endpoint
Notes / Request → Response
POST /api/documents
Upload/Version
POST /api/documents/{id}/approve
Approve workflow
GET /api/reports/exports
CSV/PDF exports

9. SQL Schema Snippets (Representative Tables)
-- organizations
CREATE TABLE organizations (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name TEXT NOT NULL,
   timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
   created_at TIMESTAMPTZ DEFAULT now()
 );
-- users
CREATE TABLE users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
   email CITEXT UNIQUE NOT NULL,
   password_hash TEXT NOT NULL,
   full_name TEXT,
   twofa_enabled BOOLEAN DEFAULT FALSE,
   status TEXT DEFAULT 'Active',
   created_at TIMESTAMPTZ DEFAULT now()
 );
-- drugs
CREATE TABLE drugs (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
   code TEXT NOT NULL,
   name TEXT NOT NULL,
   formula TEXT,
   strength TEXT,
   dosage_form TEXT,
   route TEXT,
   description TEXT,
   approval_status TEXT DEFAULT 'Draft',
   created_at TIMESTAMPTZ DEFAULT now(),
   UNIQUE(org_id, code)
 );
-- purchase_orders & po_items
CREATE TABLE purchase_orders (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   org_id UUID REFERENCES organizations(id),
   supplier_id UUID REFERENCES suppliers(id),
   site_id UUID REFERENCES sites(id),
   status TEXT,
   expected_date DATE
 );
 CREATE TABLE po_items (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
   material_id UUID REFERENCES raw_materials(id),
   qty NUMERIC,
   unit_id UUID REFERENCES units(id),
   unit_price NUMERIC
 );
-- batches & batch_consumptions
CREATE TABLE batches (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   work_order_id UUID REFERENCES work_orders(id),
   batch_no TEXT,
   manufactured_at DATE,
   expiry_date DATE,
   status TEXT
 );
 CREATE TABLE batch_consumptions (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
   material_id UUID REFERENCES raw_materials(id),
   material_batch_no TEXT,
   qty NUMERIC,
   unit_id UUID REFERENCES units(id),
   source_receipt_item_id UUID REFERENCES goods_receipt_items(id)
 );
10. Workflows & Business Rules
Workflow
Description / Rules
Procurement → QC → Warehouse
Purchase Order (Draft→Approved) → Goods Receipt Note (Quarantine) → QC Sample → QA Release (Release/Hold/Reject) → Putaway (Available). Only QA-released lots can be allocated or consumed.
Manufacturing
Work Order (Planned) → Batch (In-Process) → Material Consumption (scan lots, enforce BOM) → Batch Steps (e-sign) → Complete to QC → QA Release → Packaging → Inventory Lots (Finished).
Distribution (FEFO)
Sales Order → Allocation by First Expired First Out → Pick/Pack/Ship → Cold Chain Monitoring → Proof of Delivery. Temperature excursion auto-triggers QA hold review.

11. Validation Rules
Rule
Detail
Unique Codes
Codes for Drugs, Raw Materials, Suppliers, Sites, Storage Locations must be unique per organization.
Delete Protection
When referenced, entities cannot be hard-deleted; use status=Inactive or archive.
QA Gate
InventoryLots.status must be 'Available' to allocate/ship/consume. Quarantine/Hold/Rejected are blocked.
BOM Enforcement
Batch material consumptions must match BOM and allow tolerances (±% configurable).
Temperature Range
StorageLocations have temp_min/temp_max; sensor or manual logs outside range raise alerts.
Electronic Signature
Critical actions require re-auth with password and stamp e_signature_by + timestamp.

12. UI / Designer Notes (Light & Dark Themes)
Brand Colors: Primary Green #0B6E4F, Accent Blue #0B73D6; Success #28A745; Warning #FFC107; Error #DC3545.
Typography: Inter (Headings), Roboto (Body). Grid: 12-column responsive. Components: Buttons, Inputs, Tables, Cards, Alerts, Modals, Drawers, Pills, Tabs.
Critical Screens: Login, Dashboard, Supplier Master, Drug Catalog, Purchase Order Builder, Goods Receipt Note, QC Sample Queue, Batch EBR, Putaway, Stock Browser, Shipments, POS, Reports.
Token Group
Sample Tokens
Color Tokens
--color-primary: #0B6E4F; --color-accent: #0B73D6; --color-bg: #FFFFFF; --color-bg-dark: #0A0A0A;
Spacing
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px;
Radius
--radius-sm: 6px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px;
Elevation
--shadow-1, --shadow-2, --shadow-3 (soft)

13. Acceptance Criteria
Area
Acceptance
Auth & RBAC
JWT with refresh tokens; RBAC enforced per matrix; all auth actions audited.
Traceability
Given a finished batch → show raw material lots consumed → related receipts → shipments → accounts.
QC/QA Gate
No allocation/consumption/ship without QA Release=Release.
FEFO
Picking allocates nearest expiry first unless overridden with reason.
Reporting
Exports for Sales, Inventory (by lot & location), Deviations, OTIF, Recall coverage.
Performance
Stock and order lists paginated and filterable; responses < 1s for typical queries.

14. Glossary (Expanded Abbreviations)
Abbreviation
Full Form
PO
Purchase Order
GRN
Goods Receipt Note
QC
Quality Control
QA
Quality Assurance
EBR
Electronic Batch Record
FEFO
First Expired First Out
CAPA
Corrective and Preventive Action
SOP
Standard Operating Procedure
POD
Proof of Delivery

15. Source of Project
This document serves as the official source reference for the Ziauddin Hospital Pharmaceutical System project. All modules, ERD definitions, SQL schemas, API contracts, role-wise CRUD matrices, workflows, validation rules, and UI/UX guidelines provided here are the authoritative baseline for development and implementation.

 Developers, QA teams, and designers must strictly follow this document to ensure alignment with hospital requirements. Any changes or enhancements must be proposed through the Organization Administrator and documented in future revisions of this handoff file.

 Key References:
 • ERD & Table Definitions (Section 4)
 • Role-wise CRUD Matrix (Section 6)
 • Workflows & Business Rules (Section 10)
 • API Contracts (Section 8)
 • SQL Schema Snippets (Section 9)
 • UI / Designer Notes (Section 12)
 • Acceptance Criteria (Section 13)

 This ensures that the document is not only a design specification but also the complete project source of truth for all teams.


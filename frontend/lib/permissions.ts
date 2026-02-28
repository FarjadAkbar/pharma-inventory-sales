/**
 * Pharma Inventory & Sales — Permission System
 *
 * Roles
 * ─────
 *   System-wide  : admin, procurement_manager, production_manager, qc_manager,
 *                  qa_manager, warehouse_operator, distribution_operator, sales_rep
 *   Site-scoped  : site_manager, cashier, pharmacist, store_supervisor
 *
 * Site-scoped roles (isSiteScoped = true on the backend) can only see data
 * that belongs to their assigned sites. The frontend uses this flag to:
 *   • Hide navigation items that reference other sites
 *   • Add siteId filters when calling APIs
 *   • Block UI actions that cross site boundaries
 */

// ────────────────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────────────────

export type Role =
  // System-wide
  | "admin"
  | "procurement_manager"
  | "production_manager"
  | "qc_manager"
  | "qa_manager"
  | "warehouse_operator"
  | "distribution_operator"
  | "sales_rep"
  // Site-scoped  
  | "site_manager"
  | "cashier"
  | "pharmacist"
  | "store_supervisor"

export type Permission =
  // ── Dashboard ──────────────────────────────────────────────
  | "view_dashboard"
  | "export_dashboard"

  // ── Users & Access ─────────────────────────────────────────
  | "view_users"       | "create_users"      | "edit_users"       | "delete_users"
  | "reset_user_password"
  | "assign_user_site"    // move employee between sites

  // ── Roles & Permissions ───────────────────────────────────
  | "view_roles"       | "create_roles"       | "edit_roles"      | "delete_roles"
  | "assign_permissions"
  | "view_permissions" | "create_permissions" | "edit_permissions" | "delete_permissions"

  // ── Sites ─────────────────────────────────────────────────
  | "view_sites"       | "create_sites"       | "edit_sites"      | "delete_sites"
  | "assign_users_to_site"

  // ── Master Data — Drugs ───────────────────────────────────
  | "view_drugs"       | "create_drugs"       | "edit_drugs"      | "delete_drugs"
  | "approve_drugs"    | "reject_drugs"       | "export_drugs"

  // ── Master Data — Raw Materials ───────────────────────────
  | "view_raw_materials"    | "create_raw_materials"  | "edit_raw_materials"
  | "delete_raw_materials"  | "import_raw_materials"  | "export_raw_materials"
  | "approve_raw_materials"

  // ── Suppliers ─────────────────────────────────────────────
  | "view_suppliers"   | "create_suppliers"   | "edit_suppliers"  | "delete_suppliers"
  | "rate_suppliers"   | "export_suppliers"

  // ── Equipment & Units ─────────────────────────────────────
  | "view_equipment"   | "create_equipment"   | "edit_equipment"  | "delete_equipment"
  | "view_units"       | "create_units"       | "edit_units"      | "delete_units"

  // ── Procurement ───────────────────────────────────────────
  | "view_purchase_orders"    | "create_purchase_orders" | "edit_purchase_orders"
  | "delete_purchase_orders"  | "approve_purchase_orders"| "reject_purchase_orders"
  | "cancel_purchase_orders"  | "export_purchase_orders"

  | "view_goods_receipts"   | "create_goods_receipts"  | "edit_goods_receipts"
  | "delete_goods_receipts" | "verify_goods_receipts"

  | "view_supplier_invoices"  | "create_supplier_invoices" | "edit_supplier_invoices"
  | "delete_supplier_invoices"| "approve_supplier_invoices"| "export_supplier_invoices"

  | "view_coa" | "create_coa" | "edit_coa" | "delete_coa" | "approve_coa" | "reject_coa"

  // ── Manufacturing ─────────────────────────────────────────
  | "view_boms"        | "create_boms"        | "edit_boms"       | "delete_boms"
  | "approve_boms"     | "version_boms"

  | "view_work_orders" | "create_work_orders" | "edit_work_orders"| "delete_work_orders"
  | "start_work_orders"| "complete_work_orders"| "cancel_work_orders"

  | "view_batches"     | "create_batches"     | "edit_batches"    | "delete_batches"
  | "start_batches"    | "complete_batches"   | "release_batches" | "export_batches"

  | "view_batch_steps" | "execute_batch_steps"
  | "view_consumptions"| "create_consumptions"| "edit_consumptions"| "delete_consumptions"
  | "view_ebr"         | "approve_ebr"        | "reject_ebr"      | "export_ebr"

  // ── Quality Control ───────────────────────────────────────
  | "view_qc_tests"    | "create_qc_tests"    | "edit_qc_tests"   | "delete_qc_tests"
  | "execute_qc_tests" | "approve_qc_tests"

  | "view_qc_samples"  | "create_qc_samples"  | "edit_qc_samples" | "delete_qc_samples"
  | "receive_qc_samples"

  | "view_qc_results"  | "create_qc_results"  | "edit_qc_results" | "delete_qc_results"
  | "approve_qc_results"| "submit_qc_results_to_qa"

  // ── Quality Assurance ─────────────────────────────────────
  | "view_qa_releases"   | "create_qa_releases"  | "edit_qa_releases" | "delete_qa_releases"
  | "approve_qa_releases"| "reject_qa_releases"  | "notify_warehouse_qa_releases"

  | "view_deviations"    | "create_deviations"   | "edit_deviations"  | "delete_deviations"
  | "assign_deviations"  | "investigate_deviations" | "close_deviations"

  // ── Warehouse & Inventory ─────────────────────────────────
  | "view_inventory"    | "create_inventory"   | "edit_inventory"   | "delete_inventory"
  | "move_inventory"    | "adjust_inventory"   | "export_inventory"

  | "view_stock_movements" | "create_stock_movements" | "reverse_stock_movements"

  | "view_locations"    | "create_locations"   | "edit_locations"   | "delete_locations"

  | "view_cycle_counts" | "create_cycle_counts"| "start_cycle_counts" | "complete_cycle_counts"

  | "view_temperature_logs" | "create_temperature_logs" | "edit_temperature_logs"
  | "delete_temperature_logs"

  | "view_labels"       | "create_labels"      | "print_labels"     | "delete_labels"

  | "view_material_issues" | "create_material_issues" | "approve_material_issues"
  | "pick_material_issues" | "issue_material_issues"

  // ── Distribution ─────────────────────────────────────────
  | "view_sales_orders"    | "create_sales_orders"   | "edit_sales_orders"
  | "delete_sales_orders"  | "approve_sales_orders"  | "cancel_sales_orders"
  | "process_sales_orders" | "export_sales_orders"

  | "view_shipments"    | "create_shipments"   | "edit_shipments"   | "delete_shipments"
  | "allocate_shipments"| "pick_shipments"     | "pack_shipments"   | "ship_shipments"
  | "track_shipments"   | "cancel_shipments"

  | "view_pod"          | "create_pod"         | "complete_pod"

  // ── Sales / POS ───────────────────────────────────────────
  | "view_pos"          | "create_pos"         | "edit_pos"         | "delete_pos"
  | "void_pos"          | "refund_pos"         | "export_pos"

  | "view_accounts"     | "create_accounts"    | "edit_accounts"    | "delete_accounts"
  | "export_accounts"

  | "view_contracts"    | "create_contracts"   | "edit_contracts"   | "delete_contracts"
  | "renew_contracts"   | "terminate_contracts"

  | "view_activities"   | "create_activities"  | "edit_activities"  | "delete_activities"
  | "complete_activities"

  // ── Reporting ─────────────────────────────────────────────
  | "view_reports"      | "export_reports"     | "schedule_reports"
  | "view_recall"       | "create_recall"      | "export_recall"

// ────────────────────────────────────────────────────────────
//  Role → Permission matrix
// ────────────────────────────────────────────────────────────

export const rolePermissions: Record<Role, Permission[]> = {

  // ── Admin — everything ──────────────────────────────────────────────────
  admin: [
    "view_dashboard", "export_dashboard",
    "view_users", "create_users", "edit_users", "delete_users",
    "reset_user_password", "assign_user_site",
    "view_roles", "create_roles", "edit_roles", "delete_roles", "assign_permissions",
    "view_permissions", "create_permissions", "edit_permissions", "delete_permissions",
    "view_sites", "create_sites", "edit_sites", "delete_sites", "assign_users_to_site",
    "view_drugs", "create_drugs", "edit_drugs", "delete_drugs", "approve_drugs", "reject_drugs", "export_drugs",
    "view_raw_materials", "create_raw_materials", "edit_raw_materials", "delete_raw_materials",
    "import_raw_materials", "export_raw_materials", "approve_raw_materials",
    "view_suppliers", "create_suppliers", "edit_suppliers", "delete_suppliers", "rate_suppliers", "export_suppliers",
    "view_equipment", "create_equipment", "edit_equipment", "delete_equipment",
    "view_units", "create_units", "edit_units", "delete_units",
    "view_purchase_orders", "create_purchase_orders", "edit_purchase_orders", "delete_purchase_orders",
    "approve_purchase_orders", "reject_purchase_orders", "cancel_purchase_orders", "export_purchase_orders",
    "view_goods_receipts", "create_goods_receipts", "edit_goods_receipts", "delete_goods_receipts", "verify_goods_receipts",
    "view_supplier_invoices", "create_supplier_invoices", "edit_supplier_invoices", "delete_supplier_invoices",
    "approve_supplier_invoices", "export_supplier_invoices",
    "view_coa", "create_coa", "edit_coa", "delete_coa", "approve_coa", "reject_coa",
    "view_boms", "create_boms", "edit_boms", "delete_boms", "approve_boms", "version_boms",
    "view_work_orders", "create_work_orders", "edit_work_orders", "delete_work_orders",
    "start_work_orders", "complete_work_orders", "cancel_work_orders",
    "view_batches", "create_batches", "edit_batches", "delete_batches",
    "start_batches", "complete_batches", "release_batches", "export_batches",
    "view_batch_steps", "execute_batch_steps",
    "view_consumptions", "create_consumptions", "edit_consumptions", "delete_consumptions",
    "view_ebr", "approve_ebr", "reject_ebr", "export_ebr",
    "view_qc_tests", "create_qc_tests", "edit_qc_tests", "delete_qc_tests", "execute_qc_tests", "approve_qc_tests",
    "view_qc_samples", "create_qc_samples", "edit_qc_samples", "delete_qc_samples", "receive_qc_samples",
    "view_qc_results", "create_qc_results", "edit_qc_results", "delete_qc_results",
    "approve_qc_results", "submit_qc_results_to_qa",
    "view_qa_releases", "create_qa_releases", "edit_qa_releases", "delete_qa_releases",
    "approve_qa_releases", "reject_qa_releases", "notify_warehouse_qa_releases",
    "view_deviations", "create_deviations", "edit_deviations", "delete_deviations",
    "assign_deviations", "investigate_deviations", "close_deviations",
    "view_inventory", "create_inventory", "edit_inventory", "delete_inventory",
    "move_inventory", "adjust_inventory", "export_inventory",
    "view_stock_movements", "create_stock_movements", "reverse_stock_movements",
    "view_locations", "create_locations", "edit_locations", "delete_locations",
    "view_cycle_counts", "create_cycle_counts", "start_cycle_counts", "complete_cycle_counts",
    "view_temperature_logs", "create_temperature_logs", "edit_temperature_logs", "delete_temperature_logs",
    "view_labels", "create_labels", "print_labels", "delete_labels",
    "view_material_issues", "create_material_issues", "approve_material_issues",
    "pick_material_issues", "issue_material_issues",
    "view_sales_orders", "create_sales_orders", "edit_sales_orders", "delete_sales_orders",
    "approve_sales_orders", "cancel_sales_orders", "process_sales_orders", "export_sales_orders",
    "view_shipments", "create_shipments", "edit_shipments", "delete_shipments",
    "allocate_shipments", "pick_shipments", "pack_shipments", "ship_shipments",
    "track_shipments", "cancel_shipments",
    "view_pod", "create_pod", "complete_pod",
    "view_pos", "create_pos", "edit_pos", "delete_pos", "void_pos", "refund_pos", "export_pos",
    "view_accounts", "create_accounts", "edit_accounts", "delete_accounts", "export_accounts",
    "view_contracts", "create_contracts", "edit_contracts", "delete_contracts",
    "renew_contracts", "terminate_contracts",
    "view_activities", "create_activities", "edit_activities", "delete_activities", "complete_activities",
    "view_reports", "export_reports", "schedule_reports",
    "view_recall", "create_recall", "export_recall",
  ],

  // ── Procurement Manager ────────────────────────────────────────────────
  procurement_manager: [
    "view_dashboard",
    "view_suppliers", "create_suppliers", "edit_suppliers", "delete_suppliers", "rate_suppliers", "export_suppliers",
    "view_purchase_orders", "create_purchase_orders", "edit_purchase_orders", "delete_purchase_orders",
    "approve_purchase_orders", "reject_purchase_orders", "cancel_purchase_orders", "export_purchase_orders",
    "view_goods_receipts", "create_goods_receipts", "edit_goods_receipts", "verify_goods_receipts",
    "view_supplier_invoices", "create_supplier_invoices", "edit_supplier_invoices",
    "approve_supplier_invoices", "export_supplier_invoices",
    "view_coa", "create_coa", "edit_coa", "approve_coa", "reject_coa",
    "view_raw_materials", "create_raw_materials", "edit_raw_materials",
    "import_raw_materials", "export_raw_materials",
    "view_inventory", "view_reports", "export_reports",
  ],

  // ── Production Manager ─────────────────────────────────────────────────
  production_manager: [
    "view_dashboard",
    "view_boms", "create_boms", "edit_boms", "delete_boms", "approve_boms", "version_boms",
    "view_work_orders", "create_work_orders", "edit_work_orders", "delete_work_orders",
    "start_work_orders", "complete_work_orders", "cancel_work_orders",
    "view_batches", "create_batches", "edit_batches", "delete_batches",
    "start_batches", "complete_batches", "release_batches", "export_batches",
    "view_batch_steps", "execute_batch_steps",
    "view_consumptions", "create_consumptions", "edit_consumptions", "delete_consumptions",
    "view_ebr", "approve_ebr", "export_ebr",
    "view_drugs", "create_drugs", "edit_drugs", "approve_drugs",
    "view_raw_materials", "view_inventory",
    "view_reports", "export_reports",
  ],

  // ── QC Manager ────────────────────────────────────────────────────────
  qc_manager: [
    "view_dashboard",
    "view_qc_tests", "create_qc_tests", "edit_qc_tests", "delete_qc_tests", "execute_qc_tests", "approve_qc_tests",
    "view_qc_samples", "create_qc_samples", "edit_qc_samples", "delete_qc_samples", "receive_qc_samples",
    "view_qc_results", "create_qc_results", "edit_qc_results", "delete_qc_results",
    "approve_qc_results", "submit_qc_results_to_qa",
    "view_coa", "create_coa", "edit_coa", "approve_coa", "reject_coa",
    "view_drugs", "view_raw_materials", "view_inventory",
    "view_reports", "export_reports",
  ],

  // ── QA Manager ────────────────────────────────────────────────────────
  qa_manager: [
    "view_dashboard",
    "view_qa_releases", "create_qa_releases", "edit_qa_releases", "delete_qa_releases",
    "approve_qa_releases", "reject_qa_releases", "notify_warehouse_qa_releases",
    "view_deviations", "create_deviations", "edit_deviations", "delete_deviations",
    "assign_deviations", "investigate_deviations", "close_deviations",
    "view_qc_results", "approve_qc_results",
    "view_batches", "view_ebr", "approve_ebr", "reject_ebr", "export_ebr",
    "view_drugs",
    "view_reports", "export_reports",
  ],

  // ── Warehouse Operator ────────────────────────────────────────────────
  warehouse_operator: [
    "view_dashboard",
    "view_inventory", "create_inventory", "edit_inventory", "move_inventory", "adjust_inventory", "export_inventory",
    "view_stock_movements", "create_stock_movements", "reverse_stock_movements",
    "view_locations", "create_locations", "edit_locations",
    "view_cycle_counts", "create_cycle_counts", "start_cycle_counts", "complete_cycle_counts",
    "view_temperature_logs", "create_temperature_logs", "edit_temperature_logs",
    "view_labels", "create_labels", "print_labels",
    "view_material_issues", "create_material_issues", "approve_material_issues",
    "pick_material_issues", "issue_material_issues",
    "view_shipments",
    "view_reports",
  ],

  // ── Distribution Operator ─────────────────────────────────────────────
  distribution_operator: [
    "view_dashboard",
    "view_sales_orders", "create_sales_orders", "edit_sales_orders",
    "approve_sales_orders", "cancel_sales_orders", "process_sales_orders", "export_sales_orders",
    "view_shipments", "create_shipments", "edit_shipments",
    "allocate_shipments", "pick_shipments", "pack_shipments", "ship_shipments",
    "track_shipments", "cancel_shipments",
    "view_pod", "create_pod", "complete_pod",
    "view_accounts",
    "view_inventory", "move_inventory",
    "view_reports", "export_reports",
  ],

  // ── Sales Representative ──────────────────────────────────────────────
  sales_rep: [
    "view_dashboard",
    "view_accounts", "create_accounts", "edit_accounts", "export_accounts",
    "view_activities", "create_activities", "edit_activities", "delete_activities", "complete_activities",
    "view_contracts", "create_contracts", "edit_contracts", "renew_contracts",
    "view_sales_orders", "create_sales_orders", "edit_sales_orders", "export_sales_orders",
    "view_drugs", "view_inventory",
    "view_reports",
  ],

  // ── Site Manager (site-scoped) ────────────────────────────────────────
  site_manager: [
    "view_dashboard",
    // Can see own-site employees and reassign within their site
    "view_users", "edit_users", "assign_user_site",
    // Inventory within their site
    "view_inventory", "edit_inventory", "move_inventory",
    "view_stock_movements",
    "view_locations",
    // POS & sales at their site
    "view_pos", "create_pos", "edit_pos", "void_pos", "export_pos",
    "view_sales_orders",
    // Monitoring
    "view_batches",
    "view_temperature_logs", "create_temperature_logs",
    "view_cycle_counts",
    "view_reports", "export_reports",
  ],

  // ── Cashier (site-scoped) ─────────────────────────────────────────────
  cashier: [
    "view_dashboard",
    "view_pos", "create_pos", "edit_pos",
    "view_drugs",
    "view_inventory",
  ],

  // ── Pharmacist (site-scoped) ──────────────────────────────────────────
  pharmacist: [
    "view_dashboard",
    "view_drugs", "edit_drugs",
    "view_inventory", "adjust_inventory",
    "view_pos", "create_pos",
    "view_raw_materials",
    "view_reports",
  ],

  // ── Store Supervisor (site-scoped) ────────────────────────────────────
  store_supervisor: [
    "view_dashboard",
    "view_users",
    "view_inventory", "edit_inventory", "move_inventory",
    "view_pos", "create_pos", "edit_pos", "void_pos",
    "view_accounts",
    "view_temperature_logs", "create_temperature_logs", "edit_temperature_logs",
    "view_cycle_counts",
    "view_reports",
  ],
}

// ────────────────────────────────────────────────────────────
//  Site-scoped role list
//  (mirrors isSiteScoped on the backend)
// ────────────────────────────────────────────────────────────

export const SITE_SCOPED_ROLES: Role[] = [
  "site_manager",
  "cashier",
  "pharmacist",
  "store_supervisor",
]

export function isSiteScopedRole(role: Role | string): boolean {
  return SITE_SCOPED_ROLES.includes(role as Role)
}

// ────────────────────────────────────────────────────────────
//  Utility functions
// ────────────────────────────────────────────────────────────

/** Normalise a role name from the backend (e.g. "Site Manager") to the frontend key */
export function normaliseRoleName(role: string): Role | null {
  const map: Record<string, Role> = {
    "Admin": "admin",
    "Procurement Manager": "procurement_manager",
    "Production Manager": "production_manager",
    "QC Manager": "qc_manager",
    "QA Manager": "qa_manager",
    "Warehouse Operator": "warehouse_operator",
    "Distribution Operator": "distribution_operator",
    "Sales Representative": "sales_rep",
    "Site Manager": "site_manager",
    "Cashier": "cashier",
    "Pharmacist": "pharmacist",
    "Store Supervisor": "store_supervisor",
  }
  return map[role] ?? null
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? []
}

export function canAccessRoute(role: Role, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard":                  ["view_dashboard"],
    "/dashboard/drugs":            ["view_drugs"],
    "/dashboard/raw-materials":    ["view_raw_materials"],
    "/dashboard/suppliers":        ["view_suppliers"],
    "/dashboard/equipment":        ["view_equipment"],
    "/dashboard/units":            ["view_units"],
    "/dashboard/procurement":      ["view_purchase_orders"],
    "/dashboard/manufacturing":    ["view_batches"],
    "/dashboard/quality":          ["view_qc_tests", "view_qa_releases"],
    "/dashboard/warehouse":        ["view_inventory"],
    "/dashboard/distribution":     ["view_sales_orders", "view_shipments"],
    "/dashboard/sales":            ["view_pos", "view_accounts"],
    "/dashboard/users":            ["view_users"],
    "/dashboard/roles":            ["view_roles"],
    "/dashboard/permissions":      ["view_permissions"],
    "/dashboard/sites":            ["view_sites"],
    "/dashboard/reports":          ["view_reports"],
  }
  const required = routePermissions[route]
  if (!required) return true
  return hasAnyPermission(role, required)
}

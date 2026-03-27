/**
 * RBAC aligned with identity permission names: `{resource}.{action}` (e.g. suppliers.read).
 * Module keys (PROCUREMENT, MASTER_DATA, …) expand to multiple resources.
 * Identity seeder creates CRUD rows per resource (`buildCrudPermissionSeeds` in `@repo/shared` / backend).
 * Optional `*.manage` on a bucket or resource still grants full access if present on the role/JWT.
 */

export const RBAC_MODULES: Record<string, { resources: readonly string[]; bucket?: string }> = {
  PROCUREMENT: {
    resources: ["purchase_orders", "goods_receipts", "coa", "supplier_invoices"],
    bucket: "procurement",
  },
  MASTER_DATA: {
    resources: ["drugs", "raw_materials", "suppliers", "units", "sites", "equipment"],
    bucket: "master_data",
  },
  MANUFACTURING: {
    resources: ["boms", "work_orders", "batches", "batch_steps", "consumptions", "ebr"],
    bucket: "manufacturing",
  },
  QUALITY: {
    resources: ["qc_tests", "qc_samples", "qc_results", "qa_releases", "deviations"],
    bucket: "quality",
  },
  WAREHOUSE: {
    resources: [
      "inventory",
      "stock_movements",
      "locations",
      "cycle_counts",
      "temperature_logs",
      "labels",
      "material_issues",
    ],
    bucket: "warehouse",
  },
  DISTRIBUTION: {
    resources: ["sales_orders", "shipments", "pod"],
    bucket: "distribution",
  },
  POS: {
    resources: ["pos", "accounts", "contracts", "activities"],
    bucket: "pos",
  },
  IDENTITY: {
    resources: ["users", "roles", "permissions"],
    bucket: "identity",
  },
}

export function normalizeRbacAction(action: string): string {
  const a = action.toLowerCase()
  if (a === "view") return "read"
  return a
}

function normalizeResource(resource: string): string {
  return resource.toLowerCase().replace(/-/g, "_").trim()
}

function nameGrants(names: Set<string>, resource: string, action: string): boolean {
  const r = normalizeResource(resource)
  const a = normalizeRbacAction(action)
  if (names.has(`${r}.${a}`)) return true
  if (names.has(`${r}.manage`)) return true
  return false
}

function moduleAllows(names: Set<string>, moduleKey: string, action: string): boolean {
  const cfg = RBAC_MODULES[moduleKey.toUpperCase()]
  if (!cfg) return false
  const a = normalizeRbacAction(action)
  if (cfg.bucket && names.has(`${cfg.bucket}.manage`)) return true
  return cfg.resources.some((res) => nameGrants(names, res, a))
}

function resourceAllows(names: Set<string>, resource: string, action: string): boolean {
  const r = normalizeResource(resource)
  if (nameGrants(names, r, action)) return true
  for (const cfg of Object.values(RBAC_MODULES)) {
    if (!cfg.resources.includes(r)) continue
    if (cfg.bucket && names.has(`${cfg.bucket}.manage`)) return true
  }
  return false
}

/**
 * @param permissionNames flat list from JWT/API e.g. ["procurement.manage", "raw_materials.read"]
 * @param moduleOrResource either a module key (PROCUREMENT) or a resource (raw_materials)
 */
export function checkPermission(
  permissionNames: readonly string[] | null | undefined,
  moduleOrResource: string,
  action: string,
): boolean {
  if (!permissionNames?.length) return false
  const set = new Set(permissionNames.map((n) => n.toLowerCase()))
  const upper = moduleOrResource.toUpperCase()
  if (RBAC_MODULES[upper]) return moduleAllows(set, upper, action)
  return resourceAllows(set, moduleOrResource, action)
}

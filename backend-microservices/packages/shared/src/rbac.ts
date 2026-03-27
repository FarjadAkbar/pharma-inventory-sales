/**
 * RBAC aligned with identity permission names: `{resource}.{action}`.
 * Used by API gateway permission guard (same rules as frontend).
 *
 * Seeded permissions: use `buildCrudPermissionSeeds()` for one row per resource
 * (create, read, update, delete). Optional `{bucket}.manage` or `{resource}.manage`
 * in JWT still grants full module/resource access when present.
 */

export const RBAC_MODULES: Record<string, { resources: readonly string[]; bucket?: string }> = {
  PROCUREMENT: {
    resources: ['purchase_orders', 'goods_receipts', 'coa', 'supplier_invoices'],
    bucket: 'procurement',
  },
  MASTER_DATA: {
    resources: ['drugs', 'raw_materials', 'suppliers', 'units', 'sites', 'equipment'],
    bucket: 'master_data',
  },
  MANUFACTURING: {
    resources: ['boms', 'work_orders', 'batches', 'batch_steps', 'consumptions', 'ebr'],
    bucket: 'manufacturing',
  },
  QUALITY: {
    resources: ['qc_tests', 'qc_samples', 'qc_results', 'qa_releases', 'deviations'],
    bucket: 'quality',
  },
  WAREHOUSE: {
    resources: [
      'inventory',
      'stock_movements',
      'locations',
      'cycle_counts',
      'temperature_logs',
      'labels',
      'material_issues',
    ],
    bucket: 'warehouse',
  },
  DISTRIBUTION: {
    resources: ['sales_orders', 'shipments', 'pod'],
    bucket: 'distribution',
  },
  POS: {
    resources: ['pos', 'accounts', 'contracts', 'activities'],
    bucket: 'pos',
  },
  IDENTITY: {
    resources: ['users', 'roles', 'permissions'],
    bucket: 'identity',
  },
};

export const RBAC_CRUD_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

export type RbacPermissionSeed = {
  name: string;
  description: string;
  resource: string;
  action: string;
};

/** Rows for identity `permissions` table — every resource in RBAC_MODULES × CRUD. */
export function buildCrudPermissionSeeds(): RbacPermissionSeed[] {
  const seen = new Set<string>();
  const out: RbacPermissionSeed[] = [];
  for (const cfg of Object.values(RBAC_MODULES)) {
    for (const resource of cfg.resources) {
      for (const action of RBAC_CRUD_ACTIONS) {
        const name = `${resource}.${action}`;
        if (seen.has(name)) continue;
        seen.add(name);
        const label = resource.replace(/_/g, ' ');
        const description =
          action === 'create'
            ? `Create ${label}`
            : action === 'read'
              ? `View ${label}`
              : action === 'update'
                ? `Update ${label}`
                : `Delete ${label}`;
        out.push({ name, description, resource, action });
      }
    }
  }
  return out;
}

export function normalizeRbacAction(action: string): string {
  const a = action.toLowerCase();
  if (a === 'view') return 'read';
  return a;
}

function normalizeResource(resource: string): string {
  // Accept UI-style names like "raw-materials" and normalize to permission format.
  return resource.toLowerCase().replace(/-/g, '_').trim();
}

function nameGrants(names: Set<string>, resource: string, action: string): boolean {
  const r = normalizeResource(resource);
  const a = normalizeRbacAction(action);
  if (names.has(`${r}.${a}`)) return true;
  if (names.has(`${r}.manage`)) return true;
  return false;
}

function moduleAllows(names: Set<string>, moduleKey: string, action: string): boolean {
  const cfg = RBAC_MODULES[moduleKey.toUpperCase()];
  if (!cfg) return false;
  const a = normalizeRbacAction(action);
  if (cfg.bucket && names.has(`${cfg.bucket}.manage`)) return true;
  return cfg.resources.some((res) => nameGrants(names, res, a));
}

function resourceAllows(names: Set<string>, resource: string, action: string): boolean {
  const r = normalizeResource(resource);
  if (nameGrants(names, r, action)) return true;
  for (const cfg of Object.values(RBAC_MODULES)) {
    if (!cfg.resources.includes(r)) continue;
    if (cfg.bucket && names.has(`${cfg.bucket}.manage`)) return true;
  }
  return false;
}

export function checkPermission(
  permissionNames: readonly string[] | null | undefined,
  moduleOrResource: string,
  action: string,
): boolean {
  if (!permissionNames?.length) return false;
  const set = new Set(permissionNames.map((n) => n.toLowerCase()));
  const upper = moduleOrResource.toUpperCase();
  if (RBAC_MODULES[upper]) return moduleAllows(set, upper, action);
  return resourceAllows(set, moduleOrResource, action);
}

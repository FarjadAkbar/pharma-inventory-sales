// Enhanced Permission System for Phase 13
// Comprehensive permission structure with module, screen, action, and field-level permissions

export interface PermissionSystem {
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
            print?: boolean;
            void?: boolean;
            renew?: boolean;
            cancel?: boolean;
            complete?: boolean;
            release?: boolean;
            assign?: boolean;
            transfer?: boolean;
            [key: string]: boolean;
          };
          fields?: {
            [fieldName: string]: {
              view: boolean;
              edit: boolean;
              required: boolean;
            };
          };
        };
      };
    };
  };
}

export interface FieldPermissions {
  [fieldName: string]: {
    view: boolean;
    edit: boolean;
    required: boolean;
  };
}

export interface PermissionAwareProps {
  module: string;
  screen: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Module definitions for pharmaceutical system
export const PHARMA_MODULES = {
  IDENTITY: 'identity',
  MASTER_DATA: 'master_data',
  PROCUREMENT: 'procurement',
  MANUFACTURING: 'manufacturing',
  QUALITY_CONTROL: 'quality_control',
  QUALITY_ASSURANCE: 'quality_assurance',
  WAREHOUSE: 'warehouse',
  DISTRIBUTION: 'distribution',
  SALES: 'sales',
  REGULATORY: 'regulatory',
  REPORTING: 'reporting',
} as const;

// Screen definitions for each module
export const PHARMA_SCREENS = {
  // Identity & Authentication
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  REFRESH_TOKENS: 'refresh_tokens',
  
  // Master Data
  DRUGS: 'drugs',
  RAW_MATERIALS: 'raw_materials',
  SUPPLIERS: 'suppliers',
  DISTRIBUTORS: 'distributors',
  SITES: 'sites',
  STORAGE_LOCATIONS: 'storage_locations',
  EQUIPMENT: 'equipment',
  UNITS: 'units',
  
  // Procurement
  PURCHASE_ORDERS: 'purchase_orders',
  GOODS_RECEIPTS: 'goods_receipts',
  CERTIFICATE_OF_ANALYSIS: 'coa',
  
  // Manufacturing
  BILL_OF_MATERIALS: 'boms',
  WORK_ORDERS: 'work_orders',
  BATCHES: 'batches',
  BATCH_CONSUMPTIONS: 'consumptions',
  ELECTRONIC_BATCH_RECORDS: 'ebr',
  
  // Quality Control
  QC_TESTS: 'qc_tests',
  SAMPLE_REQUESTS: 'samples',
  SAMPLE_RESULTS: 'sample_results',
  
  // Quality Assurance
  QA_RELEASES: 'qa_releases',
  DEVIATIONS: 'deviations',
  
  // Warehouse
  INVENTORY: 'inventory',
  STOCK_MOVEMENTS: 'movements',
  WAREHOUSE_LOCATIONS: 'locations',
  TEMPERATURE_LOGS: 'temperature',
  CYCLE_COUNTS: 'cycle_counts',
  LABELS_BARCODES: 'labels',
  
  // Distribution
  SALES_ORDERS: 'sales_orders',
  SHIPMENTS: 'shipments',
  SHIPMENT_ITEMS: 'shipment_items',
  COLD_CHAIN: 'cold_chain',
  PROOF_OF_DELIVERY: 'pod',
  
  // Sales/CRM
  ACCOUNTS: 'accounts',
  ACTIVITIES: 'activities',
  CONTRACTS: 'contracts',
  POINT_OF_SALE: 'pos',
  
  // Regulatory
  REGULATORY_DOCUMENTS: 'documents',
  DOCUMENT_APPROVALS: 'approvals',
  TRAINING_RECORDS: 'training',
  
  // Reporting
  EXECUTIVE_DASHBOARDS: 'executive',
  DATA_EXPORTS: 'exports',
  SCHEDULED_REPORTS: 'scheduled',
  RECALL_COVERAGE: 'recall',
} as const;

// Action definitions
export const PHARMA_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  PRINT: 'print',
  VOID: 'void',
  RENEW: 'renew',
  CANCEL: 'cancel',
  COMPLETE: 'complete',
  RELEASE: 'release',
  ASSIGN: 'assign',
  TRANSFER: 'transfer',
  RESET_PASSWORD: 'reset_password',
  ASSIGN_PERMISSIONS: 'assign_permissions',
  RATE: 'rate',
  VERIFY: 'verify',
  VERSION: 'version',
  START: 'start',
  EXECUTE: 'execute',
  INVESTIGATE: 'investigate',
  CLOSE: 'close',
  MOVE: 'move',
  ADJUST: 'adjust',
  REVERSE: 'reverse',
  PROCESS: 'process',
  SHIP: 'ship',
  TRACK: 'track',
} as const;

// Role definitions
export const PHARMA_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  ORG_ADMIN: 'org_admin',
  PROCUREMENT_MANAGER: 'procurement_manager',
  PRODUCTION_MANAGER: 'production_manager',
  QC_MANAGER: 'qc_manager',
  QA_MANAGER: 'qa_manager',
  WAREHOUSE_OPS: 'warehouse_ops',
  DISTRIBUTION_OPS: 'distribution_ops',
  SALES_REP: 'sales_rep',
} as const;

// Comprehensive permission matrix
export const PHARMA_PERMISSION_MATRIX: PermissionSystem = {
  modules: {
    [PHARMA_MODULES.IDENTITY]: {
      screens: {
        [PHARMA_SCREENS.USERS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            reset_password: true,
          },
        },
        [PHARMA_SCREENS.ROLES]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            assign_permissions: true,
          },
        },
        [PHARMA_SCREENS.PERMISSIONS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.REFRESH_TOKENS]: {
          actions: {
            view: true,
            delete: true,
          },
        },
      },
    },
    [PHARMA_MODULES.MASTER_DATA]: {
      screens: {
        [PHARMA_SCREENS.DRUGS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            reject: true,
          },
        },
        [PHARMA_SCREENS.RAW_MATERIALS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            import: true,
          },
        },
        [PHARMA_SCREENS.SUPPLIERS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            rate: true,
          },
        },
        [PHARMA_SCREENS.DISTRIBUTORS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.SITES]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.STORAGE_LOCATIONS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.EQUIPMENT]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.UNITS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
      },
    },
    [PHARMA_MODULES.PROCUREMENT]: {
      screens: {
        [PHARMA_SCREENS.PURCHASE_ORDERS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            reject: true,
          },
        },
        [PHARMA_SCREENS.GOODS_RECEIPTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            verify: true,
          },
        },
        [PHARMA_SCREENS.CERTIFICATE_OF_ANALYSIS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            reject: true,
          },
        },
      },
    },
    [PHARMA_MODULES.MANUFACTURING]: {
      screens: {
        [PHARMA_SCREENS.BILL_OF_MATERIALS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            version: true,
          },
        },
        [PHARMA_SCREENS.WORK_ORDERS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            start: true,
            complete: true,
          },
        },
        [PHARMA_SCREENS.BATCHES]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            execute: true,
            release: true,
          },
        },
        [PHARMA_SCREENS.BATCH_CONSUMPTIONS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.ELECTRONIC_BATCH_RECORDS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            reject: true,
          },
        },
      },
    },
    [PHARMA_MODULES.QUALITY_CONTROL]: {
      screens: {
        [PHARMA_SCREENS.QC_TESTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            execute: true,
          },
        },
        [PHARMA_SCREENS.SAMPLE_REQUESTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.SAMPLE_RESULTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
          },
        },
      },
    },
    [PHARMA_MODULES.QUALITY_ASSURANCE]: {
      screens: {
        [PHARMA_SCREENS.QA_RELEASES]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            reject: true,
          },
        },
        [PHARMA_SCREENS.DEVIATIONS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            investigate: true,
            close: true,
          },
        },
      },
    },
    [PHARMA_MODULES.WAREHOUSE]: {
      screens: {
        [PHARMA_SCREENS.INVENTORY]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            move: true,
            adjust: true,
          },
        },
        [PHARMA_SCREENS.STOCK_MOVEMENTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            reverse: true,
          },
        },
        [PHARMA_SCREENS.WAREHOUSE_LOCATIONS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.TEMPERATURE_LOGS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.CYCLE_COUNTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.LABELS_BARCODES]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            print: true,
          },
        },
      },
    },
    [PHARMA_MODULES.DISTRIBUTION]: {
      screens: {
        [PHARMA_SCREENS.SALES_ORDERS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            process: true,
          },
        },
        [PHARMA_SCREENS.SHIPMENTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            ship: true,
            track: true,
          },
        },
        [PHARMA_SCREENS.SHIPMENT_ITEMS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.COLD_CHAIN]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.PROOF_OF_DELIVERY]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
      },
    },
    [PHARMA_MODULES.SALES]: {
      screens: {
        [PHARMA_SCREENS.ACCOUNTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.ACTIVITIES]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            complete: true,
          },
        },
        [PHARMA_SCREENS.CONTRACTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            renew: true,
          },
        },
        [PHARMA_SCREENS.POINT_OF_SALE]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            void: true,
          },
        },
      },
    },
    [PHARMA_MODULES.REGULATORY]: {
      screens: {
        [PHARMA_SCREENS.REGULATORY_DOCUMENTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            reject: true,
          },
        },
        [PHARMA_SCREENS.DOCUMENT_APPROVALS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.TRAINING_RECORDS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
      },
    },
    [PHARMA_MODULES.REPORTING]: {
      screens: {
        [PHARMA_SCREENS.EXECUTIVE_DASHBOARDS]: {
          actions: {
            view: true,
            export: true,
          },
        },
        [PHARMA_SCREENS.DATA_EXPORTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            cancel: true,
          },
        },
        [PHARMA_SCREENS.SCHEDULED_REPORTS]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
        [PHARMA_SCREENS.RECALL_COVERAGE]: {
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
          },
        },
      },
    },
  },
};

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<string, PermissionSystem> = {
  [PHARMA_ROLES.SYSTEM_ADMIN]: PHARMA_PERMISSION_MATRIX, // Full access
  [PHARMA_ROLES.ORG_ADMIN]: {
    modules: {
      ...PHARMA_PERMISSION_MATRIX.modules,
      [PHARMA_MODULES.IDENTITY]: {
        screens: {
          [PHARMA_SCREENS.USERS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: false, // Cannot delete users
              reset_password: true,
            },
          },
          [PHARMA_SCREENS.ROLES]: {
            actions: {
              view: true,
              create: false,
              edit: false,
              delete: false,
              assign_permissions: false,
            },
          },
          [PHARMA_SCREENS.PERMISSIONS]: {
            actions: {
              view: true,
              create: false,
              edit: false,
              delete: false,
            },
          },
          [PHARMA_SCREENS.REFRESH_TOKENS]: {
            actions: {
              view: true,
              delete: true,
            },
          },
        },
      },
    },
  },
  [PHARMA_ROLES.PROCUREMENT_MANAGER]: {
    modules: {
      [PHARMA_MODULES.MASTER_DATA]: {
        screens: {
          [PHARMA_SCREENS.SUPPLIERS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: true,
              rate: true,
            },
          },
          [PHARMA_SCREENS.DISTRIBUTORS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: true,
            },
          },
        },
      },
      [PHARMA_MODULES.PROCUREMENT]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.PROCUREMENT],
    },
  },
  [PHARMA_ROLES.PRODUCTION_MANAGER]: {
    modules: {
      [PHARMA_MODULES.MANUFACTURING]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.MANUFACTURING],
      [PHARMA_MODULES.MASTER_DATA]: {
        screens: {
          [PHARMA_SCREENS.DRUGS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: false,
              approve: true,
              reject: true,
            },
          },
          [PHARMA_SCREENS.RAW_MATERIALS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: false,
              import: true,
            },
          },
        },
      },
    },
  },
  [PHARMA_ROLES.QC_MANAGER]: {
    modules: {
      [PHARMA_MODULES.QUALITY_CONTROL]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.QUALITY_CONTROL],
      [PHARMA_MODULES.PROCUREMENT]: {
        screens: {
          [PHARMA_SCREENS.CERTIFICATE_OF_ANALYSIS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: false,
              approve: true,
              reject: true,
            },
          },
        },
      },
    },
  },
  [PHARMA_ROLES.QA_MANAGER]: {
    modules: {
      [PHARMA_MODULES.QUALITY_ASSURANCE]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.QUALITY_ASSURANCE],
      [PHARMA_MODULES.QUALITY_CONTROL]: {
        screens: {
          [PHARMA_SCREENS.SAMPLE_RESULTS]: {
            actions: {
              view: true,
              create: false,
              edit: false,
              delete: false,
              approve: true,
            },
          },
        },
      },
    },
  },
  [PHARMA_ROLES.WAREHOUSE_OPS]: {
    modules: {
      [PHARMA_MODULES.WAREHOUSE]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.WAREHOUSE],
      [PHARMA_MODULES.MASTER_DATA]: {
        screens: {
          [PHARMA_SCREENS.STORAGE_LOCATIONS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: false,
            },
          },
        },
      },
    },
  },
  [PHARMA_ROLES.DISTRIBUTION_OPS]: {
    modules: {
      [PHARMA_MODULES.DISTRIBUTION]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.DISTRIBUTION],
      [PHARMA_MODULES.WAREHOUSE]: {
        screens: {
          [PHARMA_SCREENS.INVENTORY]: {
            actions: {
              view: true,
              create: false,
              edit: false,
              delete: false,
              move: true,
              adjust: false,
            },
          },
        },
      },
    },
  },
  [PHARMA_ROLES.SALES_REP]: {
    modules: {
      [PHARMA_MODULES.SALES]: PHARMA_PERMISSION_MATRIX.modules[PHARMA_MODULES.SALES],
      [PHARMA_MODULES.DISTRIBUTION]: {
        screens: {
          [PHARMA_SCREENS.SALES_ORDERS]: {
            actions: {
              view: true,
              create: true,
              edit: true,
              delete: false,
              process: false,
            },
          },
        },
      },
    },
  },
};

// Permission checking functions
export function hasPermission(
  role: string,
  module: string,
  screen: string,
  action: string
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;

  const modulePermissions = rolePermissions.modules[module];
  if (!modulePermissions) return false;

  const screenPermissions = modulePermissions.screens[screen];
  if (!screenPermissions) return false;

  return screenPermissions.actions[action] === true;
}

export function hasFieldPermission(
  role: string,
  module: string,
  screen: string,
  field: string,
  permission: 'view' | 'edit'
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;

  const modulePermissions = rolePermissions.modules[module];
  if (!modulePermissions) return false;

  const screenPermissions = modulePermissions.screens[screen];
  if (!screenPermissions) return false;

  const fieldPermissions = screenPermissions.fields?.[field];
  if (!fieldPermissions) return true; // Default to true if no field restrictions

  return fieldPermissions[permission] === true;
}

export function hasAnyPermission(
  role: string,
  module: string,
  screen: string,
  actions: string[]
): boolean {
  return actions.some(action => hasPermission(role, module, screen, action));
}

export function hasAllPermissions(
  role: string,
  module: string,
  screen: string,
  actions: string[]
): boolean {
  return actions.every(action => hasPermission(role, module, screen, action));
}

export function getModulePermissions(role: string, module: string) {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return null;

  return rolePermissions.modules[module] || null;
}

export function getScreenPermissions(role: string, module: string, screen: string) {
  const modulePermissions = getModulePermissions(role, module);
  if (!modulePermissions) return null;

  return modulePermissions.screens[screen] || null;
}

export function canAccessModule(role: string, module: string): boolean {
  const modulePermissions = getModulePermissions(role, module);
  if (!modulePermissions) return false;

  // Check if user has any permission in any screen of the module
  return Object.values(modulePermissions.screens).some(screen => 
    Object.values(screen.actions).some(action => action === true)
  );
}

export function canAccessScreen(role: string, module: string, screen: string): boolean {
  const screenPermissions = getScreenPermissions(role, module, screen);
  if (!screenPermissions) return false;

  return screenPermissions.actions.view === true;
}

// Permission caching for performance
const permissionCache = new Map<string, boolean>();

export function getCachedPermission(
  role: string,
  module: string,
  screen: string,
  action: string
): boolean {
  const key = `${role}:${module}:${screen}:${action}`;
  
  if (permissionCache.has(key)) {
    return permissionCache.get(key)!;
  }

  const hasAccess = hasPermission(role, module, screen, action);
  permissionCache.set(key, hasAccess);
  
  return hasAccess;
}

export function clearPermissionCache(): void {
  permissionCache.clear();
}

export function preloadPermissions(role: string): void {
  // Preload commonly used permissions for better performance
  const commonPermissions = [
    { module: PHARMA_MODULES.IDENTITY, screen: PHARMA_SCREENS.USERS, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.MASTER_DATA, screen: PHARMA_SCREENS.DRUGS, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.PROCUREMENT, screen: PHARMA_SCREENS.PURCHASE_ORDERS, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.MANUFACTURING, screen: PHARMA_SCREENS.BATCHES, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.QUALITY_CONTROL, screen: PHARMA_SCREENS.QC_TESTS, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.WAREHOUSE, screen: PHARMA_SCREENS.INVENTORY, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.DISTRIBUTION, screen: PHARMA_SCREENS.SALES_ORDERS, action: PHARMA_ACTIONS.VIEW },
    { module: PHARMA_MODULES.SALES, screen: PHARMA_SCREENS.ACCOUNTS, action: PHARMA_ACTIONS.VIEW },
  ];

  commonPermissions.forEach(({ module, screen, action }) => {
    getCachedPermission(role, module, screen, action);
  });
}

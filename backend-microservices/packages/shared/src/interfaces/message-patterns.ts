export const USER_PATTERNS = {
  CREATE: { cmd: 'create_user' },
  FIND_ALL: { cmd: 'find_all_users' },
  FIND_ONE: { cmd: 'find_user' },
  UPDATE: { cmd: 'update_user' },
  DELETE: { cmd: 'delete_user' },
  FIND_BY_EMAIL: { cmd: 'find_user_by_email' },
};

export const AUTH_PATTERNS = {
  LOGIN: { cmd: 'AUTH_LOGIN' },
  LOGOUT: { cmd: 'AUTH_LOGOUT' },
  REFRESH_TOKEN: { cmd: 'AUTH_REFRESH_TOKEN' },
  RESET_PASSWORD_SEND_EMAIL: { cmd: 'AUTH_RESET_PASSWORD_SEND_EMAIL' },
  RESET_PASSWORD_CONFIRM: { cmd: 'AUTH_RESET_PASSWORD_CONFIRM' },
};

export const ROLE_PATTERNS = {
  CREATE: { cmd: 'ROLES_CREATE' },
  UPDATE: { cmd: 'ROLES_UPDATE' },
  GET_BY_ID: { cmd: 'ROLES_GET_BY_ID' },
  LIST: { cmd: 'ROLES_LIST' },
  DELETE: { cmd: 'ROLES_DELETE' },
  ADD_PERMISSION: { cmd: 'ROLES_ADD_PERMISSION' },
  REMOVE_PERMISSION: { cmd: 'ROLES_REMOVE_PERMISSION' },
};

export const PERMISSION_PATTERNS = {
  CREATE: { cmd: 'PERMISSIONS_CREATE' },
  UPDATE: { cmd: 'PERMISSIONS_UPDATE' },
  GET_BY_ID: { cmd: 'PERMISSIONS_GET_BY_ID' },
  LIST: { cmd: 'PERMISSIONS_LIST' },
  DELETE: { cmd: 'PERMISSIONS_DELETE' },
};

export const ORDER_PATTERNS = {
  CREATE: { cmd: 'create_order' },
  FIND_ALL: { cmd: 'find_all_orders' },
  FIND_BY_USER: { cmd: 'find_orders_by_user' },
};

export const SITE_PATTERNS = {
  CREATE: { cmd: 'SITES_CREATE' },
  UPDATE: { cmd: 'SITES_UPDATE' },
  GET_BY_ID: { cmd: 'SITES_GET_BY_ID' },
  LIST: { cmd: 'SITES_LIST' },
  DELETE: { cmd: 'SITES_DELETE' },
  GET_TYPES: { cmd: 'SITES_GET_TYPES' },
};

export const SUPPLIER_PATTERNS = {
  CREATE: { cmd: 'SUPPLIERS_CREATE' },
  UPDATE: { cmd: 'SUPPLIERS_UPDATE' },
  GET_BY_ID: { cmd: 'SUPPLIERS_GET_BY_ID' },
  LIST: { cmd: 'SUPPLIERS_LIST' },
  DELETE: { cmd: 'SUPPLIERS_DELETE' },
};

export const RAW_MATERIAL_PATTERNS = {
  CREATE: { cmd: 'RAW_MATERIALS_CREATE' },
  UPDATE: { cmd: 'RAW_MATERIALS_UPDATE' },
  GET_BY_ID: { cmd: 'RAW_MATERIALS_GET_BY_ID' },
  GET_BY_SUPPLIER: { cmd: 'RAW_MATERIALS_GET_BY_SUPPLIER' },
  LIST: { cmd: 'RAW_MATERIALS_LIST' },
  DELETE: { cmd: 'RAW_MATERIALS_DELETE' },
};

export const PURCHASE_ORDER_PATTERNS = {
  CREATE: { cmd: 'PURCHASE_ORDERS_CREATE' },
  UPDATE: { cmd: 'PURCHASE_ORDERS_UPDATE' },
  GET_BY_ID: { cmd: 'PURCHASE_ORDERS_GET_BY_ID' },
  LIST: { cmd: 'PURCHASE_ORDERS_LIST' },
  DELETE: { cmd: 'PURCHASE_ORDERS_DELETE' },
  APPROVE: { cmd: 'PURCHASE_ORDERS_APPROVE' },
  CANCEL: { cmd: 'PURCHASE_ORDERS_CANCEL' },
};
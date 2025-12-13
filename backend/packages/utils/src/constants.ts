// events
export enum EventNameEnum {
SEND_EMAIL = 'send-email'
}

//   roles
export enum RoleEnum {
USER = 'USER',
BACKOFFICE = 'BACKOFFICE'
}


//   service ports
/**
 * Service Ports Configuration
 * TCP ports for microservices communication
 */

export const SERVICE_PORTS = {
AUTH_SERVICE: 4001,
USERS_SERVICE: 4002,
ROLES_SERVICE: 4003,
PERMISSIONS_SERVICE: 4004,
SITES_SERVICE: 4005,
SUPPLIERS_SERVICE: 4006,
DRUGS_SERVICE: 4007,
RAW_MATERIALS_SERVICE: 4008,
PURCHASE_ORDERS_SERVICE: 4009,
GOODS_RECEIPTS_SERVICE: 4010,
QC_SAMPLES_SERVICE: 4011,
QC_TESTS_SERVICE: 4012,
QC_RESULTS_SERVICE: 4013,
QA_RELEASES_SERVICE: 4014,
DEVIATIONS_SERVICE: 4015,
ALERTS_SERVICE: 4016,
API_GATEWAY: 4000, // HTTP port
} as const;

//   message patterns
/**
 * TCP Message Patterns for Microservices Communication
 * Used by API Gateway to communicate with microservices
 */

// Auth Service Patterns
export const AUTH_LOGIN = { cmd: 'AUTH_LOGIN' };
export const AUTH_REFRESH_TOKEN = { cmd: 'AUTH_REFRESH_TOKEN' };
export const AUTH_LOGOUT = { cmd: 'AUTH_LOGOUT' };
export const AUTH_RESET_PASSWORD_SEND_EMAIL = { cmd: 'AUTH_RESET_PASSWORD_SEND_EMAIL' };
export const AUTH_RESET_PASSWORD_CONFIRM = { cmd: 'AUTH_RESET_PASSWORD_CONFIRM' };

// Users Service Patterns
export const USERS_CREATE = { cmd: 'USERS_CREATE' };
export const USERS_UPDATE = { cmd: 'USERS_UPDATE' };
export const USERS_GET_BY_ID = { cmd: 'USERS_GET_BY_ID' };
export const USERS_LIST = { cmd: 'USERS_LIST' };
export const USERS_DELETE = { cmd: 'USERS_DELETE' };
export const USERS_GET_CURRENT = { cmd: 'USERS_GET_CURRENT' };

// Roles Service Patterns
export const ROLES_CREATE = { cmd: 'ROLES_CREATE' };
export const ROLES_UPDATE = { cmd: 'ROLES_UPDATE' };
export const ROLES_GET_BY_ID = { cmd: 'ROLES_GET_BY_ID' };
export const ROLES_LIST = { cmd: 'ROLES_LIST' };
export const ROLES_DELETE = { cmd: 'ROLES_DELETE' };
export const ROLES_ADD_PERMISSION = { cmd: 'ROLES_ADD_PERMISSION' };
export const ROLES_REMOVE_PERMISSION = { cmd: 'ROLES_REMOVE_PERMISSION' };

// Permissions Service Patterns
export const PERMISSIONS_CREATE = { cmd: 'PERMISSIONS_CREATE' };
export const PERMISSIONS_UPDATE = { cmd: 'PERMISSIONS_UPDATE' };
export const PERMISSIONS_GET_BY_ID = { cmd: 'PERMISSIONS_GET_BY_ID' };
export const PERMISSIONS_LIST = { cmd: 'PERMISSIONS_LIST' };
export const PERMISSIONS_DELETE = { cmd: 'PERMISSIONS_DELETE' };

// Sites Service Patterns
export const SITES_CREATE = { cmd: 'SITES_CREATE' };
export const SITES_UPDATE = { cmd: 'SITES_UPDATE' };
export const SITES_GET_BY_ID = { cmd: 'SITES_GET_BY_ID' };
export const SITES_LIST = { cmd: 'SITES_LIST' };
export const SITES_DELETE = { cmd: 'SITES_DELETE' };
export const SITES_GET_ALL = { cmd: 'SITES_GET_ALL' };

// Suppliers Service Patterns
export const SUPPLIERS_CREATE = { cmd: 'SUPPLIERS_CREATE' };
export const SUPPLIERS_UPDATE = { cmd: 'SUPPLIERS_UPDATE' };
export const SUPPLIERS_GET_BY_ID = { cmd: 'SUPPLIERS_GET_BY_ID' };
export const SUPPLIERS_LIST = { cmd: 'SUPPLIERS_LIST' };
export const SUPPLIERS_DELETE = { cmd: 'SUPPLIERS_DELETE' };

// Drugs Service Patterns
export const DRUGS_CREATE = { cmd: 'DRUGS_CREATE' };
export const DRUGS_UPDATE = { cmd: 'DRUGS_UPDATE' };
export const DRUGS_GET_BY_ID = { cmd: 'DRUGS_GET_BY_ID' };
export const DRUGS_LIST = { cmd: 'DRUGS_LIST' };
export const DRUGS_DELETE = { cmd: 'DRUGS_DELETE' };

// Raw Materials Service Patterns
export const RAW_MATERIALS_CREATE = { cmd: 'RAW_MATERIALS_CREATE' };
export const RAW_MATERIALS_UPDATE = { cmd: 'RAW_MATERIALS_UPDATE' };
export const RAW_MATERIALS_GET_BY_ID = { cmd: 'RAW_MATERIALS_GET_BY_ID' };
export const RAW_MATERIALS_LIST = { cmd: 'RAW_MATERIALS_LIST' };
export const RAW_MATERIALS_DELETE = { cmd: 'RAW_MATERIALS_DELETE' };

// Purchase Orders Service Patterns
export const PURCHASE_ORDERS_CREATE = { cmd: 'PURCHASE_ORDERS_CREATE' };
export const PURCHASE_ORDERS_UPDATE = { cmd: 'PURCHASE_ORDERS_UPDATE' };
export const PURCHASE_ORDERS_GET_BY_ID = { cmd: 'PURCHASE_ORDERS_GET_BY_ID' };
export const PURCHASE_ORDERS_LIST = { cmd: 'PURCHASE_ORDERS_LIST' };
export const PURCHASE_ORDERS_DELETE = { cmd: 'PURCHASE_ORDERS_DELETE' };

// Goods Receipts Service Patterns
export const GOODS_RECEIPTS_CREATE = { cmd: 'GOODS_RECEIPTS_CREATE' };
export const GOODS_RECEIPTS_UPDATE = { cmd: 'GOODS_RECEIPTS_UPDATE' };
export const GOODS_RECEIPTS_GET_BY_ID = { cmd: 'GOODS_RECEIPTS_GET_BY_ID' };
export const GOODS_RECEIPTS_LIST = { cmd: 'GOODS_RECEIPTS_LIST' };
export const GOODS_RECEIPTS_DELETE = { cmd: 'GOODS_RECEIPTS_DELETE' };

// QC Samples Service Patterns
export const QC_SAMPLES_CREATE = { cmd: 'QC_SAMPLES_CREATE' };
export const QC_SAMPLES_UPDATE = { cmd: 'QC_SAMPLES_UPDATE' };
export const QC_SAMPLES_GET_BY_ID = { cmd: 'QC_SAMPLES_GET_BY_ID' };
export const QC_SAMPLES_LIST = { cmd: 'QC_SAMPLES_LIST' };
export const QC_SAMPLES_DELETE = { cmd: 'QC_SAMPLES_DELETE' };

// QC Tests Service Patterns
export const QC_TESTS_CREATE = { cmd: 'QC_TESTS_CREATE' };
export const QC_TESTS_UPDATE = { cmd: 'QC_TESTS_UPDATE' };
export const QC_TESTS_GET_BY_ID = { cmd: 'QC_TESTS_GET_BY_ID' };
export const QC_TESTS_LIST = { cmd: 'QC_TESTS_LIST' };
export const QC_TESTS_DELETE = { cmd: 'QC_TESTS_DELETE' };

// QC Results Service Patterns
export const QC_RESULTS_CREATE = { cmd: 'QC_RESULTS_CREATE' };
export const QC_RESULTS_UPDATE = { cmd: 'QC_RESULTS_UPDATE' };
export const QC_RESULTS_GET_BY_ID = { cmd: 'QC_RESULTS_GET_BY_ID' };
export const QC_RESULTS_LIST = { cmd: 'QC_RESULTS_LIST' };
export const QC_RESULTS_DELETE = { cmd: 'QC_RESULTS_DELETE' };

// QA Releases Service Patterns
export const QA_RELEASES_CREATE = { cmd: 'QA_RELEASES_CREATE' };
export const QA_RELEASES_UPDATE = { cmd: 'QA_RELEASES_UPDATE' };
export const QA_RELEASES_GET_BY_ID = { cmd: 'QA_RELEASES_GET_BY_ID' };
export const QA_RELEASES_LIST = { cmd: 'QA_RELEASES_LIST' };
export const QA_RELEASES_DELETE = { cmd: 'QA_RELEASES_DELETE' };

// Deviations Service Patterns
export const DEVIATIONS_CREATE = { cmd: 'DEVIATIONS_CREATE' };
export const DEVIATIONS_UPDATE = { cmd: 'DEVIATIONS_UPDATE' };
export const DEVIATIONS_GET_BY_ID = { cmd: 'DEVIATIONS_GET_BY_ID' };
export const DEVIATIONS_LIST = { cmd: 'DEVIATIONS_LIST' };
export const DEVIATIONS_DELETE = { cmd: 'DEVIATIONS_DELETE' };

// Alerts Service Patterns
export const ALERTS_CREATE = { cmd: 'ALERTS_CREATE' };
export const ALERTS_LIST = { cmd: 'ALERTS_LIST' };

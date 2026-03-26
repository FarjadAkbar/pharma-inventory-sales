import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';

export type RequiredPermission = {
  /** Resource name e.g. raw_materials, or use module for MODULE keys */
  resource?: string;
  /** e.g. PROCUREMENT — checked when resource omitted */
  module?: string;
  action: string;
};

export const RequirePermissions = (spec: RequiredPermission) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, spec);

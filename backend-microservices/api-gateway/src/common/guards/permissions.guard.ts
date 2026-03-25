import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { checkPermission } from '@repo/shared';
import {
  REQUIRE_PERMISSIONS_KEY,
  RequiredPermission,
} from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const spec = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!spec) return true;

    const request = context.switchToHttp().getRequest();
    const names: string[] | undefined = request.user?.permissionNames;

    const target = spec.resource ?? spec.module;
    if (!target) {
      throw new ForbiddenException('Permission check misconfigured');
    }

    if (!checkPermission(names, target, spec.action)) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'You do not have permission for this action',
        error: 'Forbidden',
      });
    }
    return true;
  }
}

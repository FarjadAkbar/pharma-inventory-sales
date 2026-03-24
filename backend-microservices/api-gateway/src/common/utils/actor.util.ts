import { UnauthorizedException } from '@nestjs/common';

/** JWT payload from JwtAuthGuard (sub = user id). */
export function resolveActorId(user: { sub?: number; id?: number } | undefined): number {
  if (!user) {
    throw new UnauthorizedException('Authentication required');
  }
  const raw = user.sub ?? user.id;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) {
    throw new UnauthorizedException('Invalid user id in token');
  }
  return n;
}

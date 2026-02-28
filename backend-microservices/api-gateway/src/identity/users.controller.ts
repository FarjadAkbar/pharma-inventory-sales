import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Req,
  Query,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, UpdateUserDto, USER_PATTERNS } from '@repo/shared';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

/** Decoded JWT payload shape (subset of fields we care about) */
interface JwtContext {
  sub: number;
  roleId?: number;
  roleName?: string;
  siteIds?: number[];
  isSiteScoped?: boolean;
}

/** Decode JWT payload without verifying the signature (gateway trusts the upstream). */
function decodeJwt(token: string): JwtContext | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

/** Extract and decode JWT from an Express request. */
function extractJwt(req: Request): JwtContext {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedException('No token provided');
  }
  const token = authHeader.substring(7);
  const payload = decodeJwt(token);
  if (!payload) throw new UnauthorizedException('Invalid token');
  return payload;
}

@Controller('users')
export class UsersController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  // ── Create ────────────────────────────────────────────────────────────────

  @Post()
  async create(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const ctx = extractJwt(req);

    // Site managers can only create users for their own site(s)
    if (ctx.isSiteScoped) {
      const incomingSiteIds: number[] = (createUserDto as any).siteIds ?? [];
      const allowedSiteIds = ctx.siteIds ?? [];
      const unauthorized = incomingSiteIds.some(id => !allowedSiteIds.includes(id));
      if (unauthorized) {
        throw new ForbiddenException('You can only create users for your assigned site(s)');
      }
    }

    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.CREATE, createUserDto),
    );
  }

  // ── List ──────────────────────────────────────────────────────────────────

  /**
   * GET /users
   * - System-wide roles (Admin, Production Manager, etc.) → all users
   * - Site-scoped roles (Site Manager, Cashier, etc.)      → only users on their site(s)
   *
   * Optional query params:
   *   ?siteId=1            force-filter by a single site (admin use)
   *   ?siteIds=1,2,3       force-filter by multiple sites (admin use)
   */
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('siteId') siteIdParam?: string,
    @Query('siteIds') siteIdsParam?: string,
  ) {
    const ctx = extractJwt(req);

    // Determine which site filter to apply
    let filterSiteIds: number[] | null = null;

    if (ctx.isSiteScoped) {
      // Force site-scoped roles to see only their own sites — ignores query params
      filterSiteIds = ctx.siteIds ?? [];
    } else if (siteIdParam) {
      filterSiteIds = [parseInt(siteIdParam, 10)].filter(n => !isNaN(n));
    } else if (siteIdsParam) {
      filterSiteIds = siteIdsParam.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }

    if (filterSiteIds && filterSiteIds.length > 0) {
      return await firstValueFrom(
        this.identityClient.send(USER_PATTERNS.FIND_BY_SITE_IDS, filterSiteIds),
      );
    }

    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.FIND_ALL, {}),
    );
  }

  // ── Current user ──────────────────────────────────────────────────────────

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const ctx = extractJwt(req);
    const userId = ctx.sub;
    if (!userId) throw new UnauthorizedException('Invalid token: user ID not found');
    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.FIND_ONE, userId),
    );
  }

  // ── Single user ───────────────────────────────────────────────────────────

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const ctx = extractJwt(req);

    if (ctx.isSiteScoped) {
      // Fetch the target user and verify they share a site
      const targetUser = await firstValueFrom(
        this.identityClient.send(USER_PATTERNS.FIND_ONE, +id),
      ) as any;

      if (!targetUser) throw new UnauthorizedException('User not found');

      const targetSiteIds: number[] = targetUser.siteIds ?? [];
      const requesterSiteIds: number[] = ctx.siteIds ?? [];
      const sharesASite = targetSiteIds.some(s => requesterSiteIds.includes(s));

      if (!sharesASite) {
        throw new ForbiddenException('You do not have permission to view this user');
      }
      return targetUser;
    }

    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.FIND_ONE, +id),
    );
  }

  // ── Update ────────────────────────────────────────────────────────────────

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const ctx = extractJwt(req);

    if (ctx.isSiteScoped) {
      // Verify the user being updated belongs to this manager's site
      const targetUser = await firstValueFrom(
        this.identityClient.send(USER_PATTERNS.FIND_ONE, +id),
      ) as any;

      const targetSiteIds: number[] = targetUser?.siteIds ?? [];
      const requesterSiteIds: number[] = ctx.siteIds ?? [];
      const sharesASite = targetSiteIds.some(s => requesterSiteIds.includes(s));

      if (!sharesASite) {
        throw new ForbiddenException('You do not have permission to update this user');
      }

      // Prevent site managers from reassigning a user outside their own sites
      if ((updateUserDto as any).siteIds) {
        const newSiteIds: number[] = (updateUserDto as any).siteIds;
        const unauthorized = newSiteIds.some(s => !requesterSiteIds.includes(s));
        if (unauthorized) {
          throw new ForbiddenException('You can only assign users to your own site(s)');
        }
      }
    }

    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.UPDATE, { id: +id, updateUserDto }),
    );
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const ctx = extractJwt(req);

    if (ctx.isSiteScoped) {
      throw new ForbiddenException('Site managers cannot delete users');
    }

    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.DELETE, +id),
    );
  }

  // ── Shift Employee ────────────────────────────────────────────────────────

  /**
   * PUT /users/:id/shift-site
   * Body: { siteIds: number[] }
   *
   * Move an employee to different site(s). System-wide managers and admins only.
   * This decouples site assignment from the generic update endpoint so you
   * can give "assign_site" permission independently of full-edit access.
   */
  @Put(':id/shift-site')
  async shiftSite(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { siteIds: number[] },
  ) {
    const ctx = extractJwt(req);

    // Only non-site-scoped roles (e.g. Admin) can shift employees between sites
    if (ctx.isSiteScoped) {
      throw new ForbiddenException(
        'Site managers cannot reassign employees across sites. Contact an administrator.',
      );
    }

    return await firstValueFrom(
      this.identityClient.send(USER_PATTERNS.UPDATE, {
        id: +id,
        updateUserDto: { siteIds: body.siteIds },
      }),
    );
  }
}

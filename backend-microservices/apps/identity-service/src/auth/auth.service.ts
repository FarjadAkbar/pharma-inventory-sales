import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { verify, hash } from '@node-rs/bcrypt';
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutDto,
  ResetPasswordSendEmailDto,
  ResetPasswordConfirmDto,
} from '@repo/shared';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await verify(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // Fetch enriched user to get role info (including isSiteScoped)
    const enrichedUser = await this.usersService.findOne(user.id) as any;

    // Parse siteIds from the user record
    const siteIds = this.parseSiteIds(user.siteIds);
    const isSiteScoped = enrichedUser?.role?.isSiteScoped ?? false;

    // Build JWT payload — include site context for server-side filtering
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: enrichedUser?.role?.name ?? null,
      siteIds,          // which sites this user belongs to
      isSiteScoped,     // whether their role restricts them to those sites
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.refreshTokenRepository.save({ token: refreshToken, userId: user.id, expiresAt });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: enrichedUser?.role?.name,
        siteIds,
        isSiteScoped,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenDto.refreshToken, userId: payload.sub },
      });
      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findOne(payload.sub) as any;
      if (!user) throw new UnauthorizedException('User not found');

      const siteIds = payload.siteIds ?? [];
      const isSiteScoped = user.role?.isSiteScoped ?? payload.isSiteScoped ?? false;

      const newPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        roleName: user.role?.name ?? null,
        siteIds,
        isSiteScoped,
      };

      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      tokenRecord.token = newRefreshToken;
      tokenRecord.expiresAt = expiresAt;
      await this.refreshTokenRepository.save(tokenRecord);

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    await this.refreshTokenRepository.delete({ token: logoutDto.refreshToken });
  }

  async resetPasswordSendEmail(dto: ResetPasswordSendEmailDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) return { message: 'If the email exists, a password reset link has been sent' };
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPasswordConfirm(dto: ResetPasswordConfirmDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(dto.token);
      await hash(dto.newPassword, 10);
      await this.usersService.update(payload.sub, { password: dto.newPassword } as any);
      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private parseSiteIds(siteIds: number[] | string): number[] {
    if (!siteIds) return [];
    if (Array.isArray(siteIds)) return siteIds.map(Number).filter(n => !isNaN(n));
    if (typeof siteIds === 'string' && siteIds.trim()) {
      return siteIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    }
    return [];
  }
}

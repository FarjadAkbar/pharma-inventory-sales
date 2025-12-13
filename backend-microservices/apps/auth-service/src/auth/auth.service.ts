import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { verify, hash } from '@node-rs/bcrypt';
import { 
  LoginDto, 
  LoginResponseDto, 
  RefreshTokenDto, 
  RefreshTokenResponseDto,
  LogoutDto,
  ResetPasswordSendEmailDto,
  ResetPasswordConfirmDto,
  USER_PATTERNS 
} from '@repo/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Find user by email
    const user = await firstValueFrom(
      this.userClient.send(USER_PATTERNS.FIND_BY_EMAIL, loginDto.email)
    );

    if (!user) {
      throw new RpcException({
        status: 401,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await verify(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        status: 401,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name,
      roleId: user.roleId 
    };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      
      // Check if refresh token exists in database
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenDto.refreshToken, userId: payload.sub },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new RpcException({
          status: 401,
          message: 'Invalid refresh token',
        });
      }

      // Get user - need to get full user entity
      const user = await firstValueFrom(
        this.userClient.send(USER_PATTERNS.FIND_ONE, payload.sub)
      );

      if (!user) {
        throw new RpcException({
          status: 401,
          message: 'User not found',
        });
      }

      // Generate new tokens
      const newPayload = { 
        sub: user.id, 
        email: user.email,
        name: user.name,
        roleId: user.roleId 
      };
      
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Update refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      tokenRecord.token = newRefreshToken;
      tokenRecord.expiresAt = expiresAt;
      await this.refreshTokenRepository.save(tokenRecord);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid refresh token',
      });
    }
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    await this.refreshTokenRepository.delete({ token: logoutDto.refreshToken });
  }

  async resetPasswordSendEmail(dto: ResetPasswordSendEmailDto): Promise<{ message: string }> {
    // Find user by email
    const user = await firstValueFrom(
      this.userClient.send(USER_PATTERNS.FIND_BY_EMAIL, dto.email)
    );

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset token
    // In a real implementation, you would send an email here

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPasswordConfirm(dto: ResetPasswordConfirmDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(dto.token);
      
      // Hash new password
      const hashedPassword = await hash(dto.newPassword, 10);

      // Update user password
      await firstValueFrom(
        this.userClient.send(USER_PATTERNS.UPDATE, {
          id: payload.sub,
          updateUserDto: {
            password: hashedPassword,
          },
        })
      );

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid or expired reset token',
      });
    }
  }
}


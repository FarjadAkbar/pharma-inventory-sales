import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import {
  AUTH_PATTERNS,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ResetPasswordSendEmailDto,
  ResetPasswordConfirmDto,
} from '@repo/shared';
import { Public } from '../common/decorators/public.decorator';

/** TCP/RPC errors from Nest microservices often nest `UnauthorizedException` in `error.message`. */
function parseIdentityRpcError(error: unknown): { status?: number; message: string } {
  const e = error as Record<string, unknown> & {
    error?: { statusCode?: unknown; message?: unknown };
    response?: { statusCode?: unknown; message?: unknown };
  };
  if (!e) return { message: 'Login failed' };

  const msgField = e.message;
  const nested =
    msgField && typeof msgField === 'object' && msgField !== null
      ? (msgField as { statusCode?: unknown; message?: unknown; error?: unknown })
      : undefined;

  const statusRaw =
    e.status ??
    e.statusCode ??
    nested?.statusCode ??
    e.error?.statusCode ??
    e.response?.statusCode;

  let status: number | undefined;
  if (typeof statusRaw === 'number' && statusRaw >= 400 && statusRaw <= 599) status = statusRaw;
  else if (typeof statusRaw === 'string') {
    const n = parseInt(statusRaw, 10);
    if (!Number.isNaN(n) && n >= 400 && n <= 599) status = n;
  }

  let message = 'Login failed';
  if (typeof msgField === 'string') message = msgField;
  else if (nested && typeof nested.message === 'string') message = nested.message;
  else if (typeof e.response?.message === 'string') message = e.response.message;
  else if (e.error?.message != null) message = String(e.error.message);

  return { status, message };
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await firstValueFrom(
        this.identityClient.send(AUTH_PATTERNS.LOGIN, loginDto).pipe(
          catchError((error) => {
            if (typeof error === 'string') {
              return throwError(() => new BadRequestException(error));
            }
            const { status: errorStatus, message: errorMessage } = parseIdentityRpcError(error);
            const name = (error as { name?: string })?.name;
            if (
              errorStatus === 401 ||
              errorMessage.includes('Invalid credentials') ||
              errorMessage.includes('Unauthorized') ||
              name === 'UnauthorizedException'
            ) {
              return throwError(
                () => new UnauthorizedException(errorMessage || 'Invalid credentials'),
              );
            }
            return throwError(() => new BadRequestException(errorMessage));
          }),
        ),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      if (typeof error === 'string') {
        throw new BadRequestException(error);
      }
      const { status: errorStatus, message: errorMessage } = parseIdentityRpcError(error);
      const name = (error as { name?: string })?.name;
      if (
        errorStatus === 401 ||
        errorMessage.includes('Invalid credentials') ||
        errorMessage.includes('Unauthorized') ||
        name === 'UnauthorizedException'
      ) {
        throw new UnauthorizedException(errorMessage || 'Invalid credentials');
      }
      throw new BadRequestException(errorMessage);
    }
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return await firstValueFrom(
        this.identityClient.send(AUTH_PATTERNS.REFRESH_TOKEN, refreshTokenDto).pipe(
          catchError((error) => {
            if (
              error?.status === 401 ||
              error?.message?.includes('Invalid') ||
              error?.message?.includes('Unauthorized')
            ) {
              throw new UnauthorizedException(error?.message || 'Invalid refresh token');
            }
            throw new BadRequestException(error?.message || 'Token refresh failed');
          }),
        ),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error?.status === 401) {
        throw new UnauthorizedException(error?.message || 'Invalid refresh token');
      }
      throw new BadRequestException(error?.message || 'Token refresh failed');
    }
  }

  @Public()
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    try {
      return await firstValueFrom(
        this.identityClient.send(AUTH_PATTERNS.LOGOUT, logoutDto).pipe(
          catchError((error) => {
            throw new BadRequestException(error?.message || 'Logout failed');
          }),
        ),
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Logout failed');
    }
  }

  @Public()
  @Post('reset-password/send-email')
  async resetPasswordSendEmail(@Body() dto: ResetPasswordSendEmailDto) {
    try {
      return await firstValueFrom(
        this.identityClient.send(AUTH_PATTERNS.RESET_PASSWORD_SEND_EMAIL, dto).pipe(
          catchError((error) => {
            throw new BadRequestException(error?.message || 'Failed to send reset email');
          }),
        ),
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Failed to send reset email');
    }
  }

  @Public()
  @Post('reset-password/confirm')
  async resetPasswordConfirm(@Body() dto: ResetPasswordConfirmDto) {
    try {
      return await firstValueFrom(
        this.identityClient.send(AUTH_PATTERNS.RESET_PASSWORD_CONFIRM, dto).pipe(
          catchError((error) => {
            if (
              error?.status === 401 ||
              error?.message?.includes('Invalid') ||
              error?.message?.includes('Unauthorized')
            ) {
              throw new UnauthorizedException(
                error?.message || 'Invalid or expired reset token',
              );
            }
            throw new BadRequestException(error?.message || 'Password reset failed');
          }),
        ),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error?.status === 401) {
        throw new UnauthorizedException(
          error?.message || 'Invalid or expired reset token',
        );
      }
      throw new BadRequestException(error?.message || 'Password reset failed');
    }
  }
}

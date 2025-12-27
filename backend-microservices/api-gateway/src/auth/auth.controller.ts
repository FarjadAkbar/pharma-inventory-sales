import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
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

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.LOGIN, loginDto).pipe(
          catchError(error => {
            // Log error for debugging
            console.error('Login error from microservice:', JSON.stringify(error, null, 2));
            
            // Extract error details from RpcException - check multiple possible structures
            let errorMessage = 'Login failed';
            let errorStatus: number | undefined;
            
            // Try different error structures
            if (typeof error === 'string') {
              errorMessage = error;
            } else if (error?.message) {
              errorMessage = error.message;
            } else if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.response?.message) {
              errorMessage = error.response.message;
            }
            
            // Extract status code
            errorStatus = error?.status || 
                         error?.statusCode || 
                         error?.error?.statusCode || 
                         error?.error?.status ||
                         error?.response?.statusCode ||
                         error?.response?.status;
            
            // Check if it's an UnauthorizedException (401)
            // RpcException wraps HTTP exceptions, so check for 401 status or "Invalid credentials" message
            if (errorStatus === 401 || 
                errorMessage.includes('Invalid credentials') || 
                errorMessage.includes('Unauthorized') ||
                error?.name === 'UnauthorizedException') {
              return throwError(() => new UnauthorizedException(errorMessage || 'Invalid credentials'));
            }
            
            // Handle other errors
            return throwError(() => new BadRequestException(errorMessage));
          })
        )
      );
    } catch (error) {
      // Handle exceptions thrown in catchError
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Log error for debugging
      console.error('Login catch error:', JSON.stringify(error, null, 2));
      
      // Extract error details
      let errorMessage = 'Login failed';
      let errorStatus: number | undefined;
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }
      
      errorStatus = error?.status || 
                   error?.statusCode || 
                   error?.error?.statusCode || 
                   error?.error?.status;
      
      if (errorStatus === 401 || 
          errorMessage.includes('Invalid credentials') || 
          errorMessage.includes('Unauthorized') ||
          error?.name === 'UnauthorizedException') {
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
        this.authClient.send(AUTH_PATTERNS.REFRESH_TOKEN, refreshTokenDto).pipe(
          catchError(error => {
            if (error?.status === 401 || error?.message?.includes('Invalid') || error?.message?.includes('Unauthorized')) {
              throw new UnauthorizedException(error?.message || 'Invalid refresh token');
            }
            throw new BadRequestException(error?.message || 'Token refresh failed');
          })
        )
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
        this.authClient.send(AUTH_PATTERNS.LOGOUT, logoutDto).pipe(
          catchError(error => {
            throw new BadRequestException(error?.message || 'Logout failed');
          })
        )
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
        this.authClient.send(AUTH_PATTERNS.RESET_PASSWORD_SEND_EMAIL, dto).pipe(
          catchError(error => {
            throw new BadRequestException(error?.message || 'Failed to send reset email');
          })
        )
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
        this.authClient.send(AUTH_PATTERNS.RESET_PASSWORD_CONFIRM, dto).pipe(
          catchError(error => {
            if (error?.status === 401 || error?.message?.includes('Invalid') || error?.message?.includes('Unauthorized')) {
              throw new UnauthorizedException(error?.message || 'Invalid or expired reset token');
            }
            throw new BadRequestException(error?.message || 'Password reset failed');
          })
        )
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error?.status === 401) {
        throw new UnauthorizedException(error?.message || 'Invalid or expired reset token');
      }
      throw new BadRequestException(error?.message || 'Password reset failed');
    }
  }
}


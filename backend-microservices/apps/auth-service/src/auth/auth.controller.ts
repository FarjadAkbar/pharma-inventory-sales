import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { 
  AUTH_PATTERNS,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ResetPasswordSendEmailDto,
  ResetPasswordConfirmDto,
} from '@repo/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  async logout(@Payload() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }

  @MessagePattern(AUTH_PATTERNS.RESET_PASSWORD_SEND_EMAIL)
  async resetPasswordSendEmail(@Payload() dto: ResetPasswordSendEmailDto) {
    return this.authService.resetPasswordSendEmail(dto);
  }

  @MessagePattern(AUTH_PATTERNS.RESET_PASSWORD_CONFIRM)
  async resetPasswordConfirm(@Payload() dto: ResetPasswordConfirmDto) {
    return this.authService.resetPasswordConfirm(dto);
  }
}


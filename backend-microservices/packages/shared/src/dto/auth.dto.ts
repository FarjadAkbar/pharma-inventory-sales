import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
    /** Site IDs this user is assigned to */
    siteIds?: number[];
    /**
     * When true the user's role is site-scoped — they should only see data
     * that belongs to one of their siteIds.
     */
    isSiteScoped?: boolean;
  };
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  refreshToken: string;
}

export class ResetPasswordSendEmailDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordConfirmDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}


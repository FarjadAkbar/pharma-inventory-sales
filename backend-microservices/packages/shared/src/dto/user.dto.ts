import { IsEmail, IsString, MinLength, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  siteIds?: number[];
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsNumber()
  @IsOptional()
  roleId?: number;
}

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  role?: {
    id: number;
    name: string;
    permissions?: Array<{
      id: number;
      name: string;
    }>;
  };
  siteIds?: number[];
  sites?: Array<{
    id: number;
    name: string;
    address?: string;
    city?: string;
    type?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
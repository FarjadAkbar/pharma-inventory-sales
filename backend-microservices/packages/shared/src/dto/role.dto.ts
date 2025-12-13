import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  permissions?: Array<{
    id: number;
    name: string;
    description?: string;
    resource?: string;
    action?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class AddPermissionToRoleDto {
  @IsNumber()
  roleId: number;

  @IsNumber()
  permissionId: number;
}

export class RemovePermissionFromRoleDto {
  @IsNumber()
  roleId: number;

  @IsNumber()
  permissionId: number;
}


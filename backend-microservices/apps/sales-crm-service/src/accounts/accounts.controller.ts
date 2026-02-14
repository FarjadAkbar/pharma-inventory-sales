import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import {
  ACCOUNT_PATTERNS,
  CreateAccountDto,
  UpdateAccountDto,
  AccountType,
  AccountStatus,
} from '@repo/shared';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @MessagePattern(ACCOUNT_PATTERNS.CREATE)
  create(@Payload() createDto: CreateAccountDto) {
    return this.accountsService.create(createDto);
  }

  @MessagePattern(ACCOUNT_PATTERNS.LIST)
  findAll(@Payload() params?: {
    search?: string;
    type?: AccountType;
    status?: AccountStatus;
    page?: number;
    limit?: number;
  }) {
    return this.accountsService.findAll(params);
  }

  @MessagePattern(ACCOUNT_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.accountsService.findOne(id);
  }

  @MessagePattern(ACCOUNT_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateAccountDto }) {
    return this.accountsService.update(data.id, data.updateDto);
  }

  @MessagePattern(ACCOUNT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.accountsService.delete(id);
  }

  @MessagePattern(ACCOUNT_PATTERNS.SEARCH)
  search(@Payload() params: { search: string; page?: number; limit?: number }) {
    return this.accountsService.findAll({ ...params, search: params.search });
  }
}

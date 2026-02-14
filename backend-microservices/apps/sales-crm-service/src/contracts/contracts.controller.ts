import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContractsService } from './contracts.service';
import {
  CONTRACT_PATTERNS,
  ContractStatus,
  ContractType,
  CreateContractDto,
  UpdateContractDto,
} from '@repo/shared';

@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @MessagePattern(CONTRACT_PATTERNS.CREATE)
  create(@Payload() createDto: CreateContractDto) {
    return this.contractsService.create(createDto);
  }

  @MessagePattern(CONTRACT_PATTERNS.LIST)
  findAll(@Payload() params?: {
    search?: string;
    accountId?: number;
    type?: ContractType;
    status?: ContractStatus;
    page?: number;
    limit?: number;
  }) {
    return this.contractsService.findAll(params);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.contractsService.findOne(id);
  }

  @MessagePattern(CONTRACT_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateContractDto }) {
    return this.contractsService.update(data.id, data.updateDto);
  }

  @MessagePattern(CONTRACT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.contractsService.delete(id);
  }

  @MessagePattern(CONTRACT_PATTERNS.RENEW)
  renew(@Payload() data: { id: number; renewalDate: string; endDate: string; renewedBy: number }) {
    return this.contractsService.renew(data.id, data);
  }

  @MessagePattern(CONTRACT_PATTERNS.TERMINATE)
  terminate(@Payload() data: { id: number; terminatedBy: number; reason?: string }) {
    return this.contractsService.terminate(data.id, data);
  }
}

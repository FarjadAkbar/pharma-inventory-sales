import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BOMsService } from './boms.service';
import {
  MANUFACTURING_PATTERNS,
  CreateBOMDto,
  UpdateBOMDto,
  BOMStatus,
} from '@repo/shared';

@Controller()
export class BOMsController {
  constructor(private readonly bomsService: BOMsService) {}

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_CREATE)
  create(@Payload() createDto: CreateBOMDto) {
    return this.bomsService.create(createDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_LIST)
  findAll(@Payload() params?: {
    search?: string;
    drugId?: number;
    status?: BOMStatus;
    version?: number;
    page?: number;
    limit?: number;
  }) {
    return this.bomsService.findAll(params);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.bomsService.findOne(id);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_GET_BY_DRUG)
  findByDrug(@Payload() data: { drugId: number; status?: BOMStatus }) {
    return this.bomsService.findByDrug(data.drugId, data.status);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateBOMDto }) {
    return this.bomsService.update(data.id, data.updateDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_APPROVE)
  approve(@Payload() data: { id: number; approvedBy: number }) {
    return this.bomsService.approve(data.id, data.approvedBy);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BOM_DELETE)
  delete(@Payload() id: number) {
    return this.bomsService.delete(id);
  }
}


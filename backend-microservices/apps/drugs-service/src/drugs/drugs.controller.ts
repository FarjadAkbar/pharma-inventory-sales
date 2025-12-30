import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DrugsService } from './drugs.service';
import {
  DRUG_PATTERNS,
  CreateDrugDto,
  UpdateDrugDto,
} from '@repo/shared';

@Controller()
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @MessagePattern(DRUG_PATTERNS.CREATE)
  create(@Payload() createDto: CreateDrugDto) {
    return this.drugsService.create(createDto);
  }

  @MessagePattern(DRUG_PATTERNS.LIST)
  findAll(@Payload() params?: any) {
    return this.drugsService.findAll(params);
  }

  @MessagePattern(DRUG_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.drugsService.findOne(id);
  }

  @MessagePattern(DRUG_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateDrugDto }) {
    return this.drugsService.update(data.id, data.updateDto);
  }

  @MessagePattern(DRUG_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.drugsService.delete(id);
  }
}


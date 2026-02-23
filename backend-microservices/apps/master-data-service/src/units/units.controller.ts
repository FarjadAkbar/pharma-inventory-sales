import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UnitsService } from './units.service';
import { UNIT_PATTERNS } from '@repo/shared';

@Controller()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @MessagePattern(UNIT_PATTERNS.CREATE)
  create(@Payload() dto: any) {
    return this.unitsService.create(dto);
  }

  @MessagePattern(UNIT_PATTERNS.LIST)
  findAll() {
    return this.unitsService.findAll();
  }

  @MessagePattern(UNIT_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.unitsService.findOne(id);
  }

  @MessagePattern(UNIT_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; code?: string; name?: string; symbol?: string }) {
    return this.unitsService.update(data.id, data);
  }

  @MessagePattern(UNIT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.unitsService.delete(id);
  }
}

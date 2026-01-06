import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MaterialConsumptionService } from './material-consumption.service';
import {
  MANUFACTURING_PATTERNS,
  ConsumeMaterialDto,
  UpdateMaterialConsumptionDto,
  MaterialConsumptionStatus,
} from '@repo/shared';

@Controller()
export class MaterialConsumptionController {
  constructor(private readonly materialConsumptionService: MaterialConsumptionService) {}

  @MessagePattern(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_CREATE)
  consume(@Payload() data: { batchId: number; consumeDto: ConsumeMaterialDto }) {
    return this.materialConsumptionService.consume(data.batchId, data.consumeDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_BATCH)
  findByBatch(@Payload() batchId: number) {
    return this.materialConsumptionService.findAll(batchId);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.materialConsumptionService.findOne(id);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_LIST)
  findAll(@Payload() params?: {
    batchId?: number;
    materialId?: number;
    status?: MaterialConsumptionStatus;
    page?: number;
    limit?: number;
  }) {
    return this.materialConsumptionService.findAll(params);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateMaterialConsumptionDto }) {
    return this.materialConsumptionService.update(data.id, data.updateDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_DELETE)
  remove(@Payload() id: number) {
    return this.materialConsumptionService.remove(id);
  }
}


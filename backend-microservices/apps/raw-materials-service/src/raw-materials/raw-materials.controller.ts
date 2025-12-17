import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RawMaterialsService } from './raw-materials.service';
import { 
  RAW_MATERIAL_PATTERNS,
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
} from '@repo/shared';

@Controller()
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  @MessagePattern(RAW_MATERIAL_PATTERNS.CREATE)
  create(@Payload() createRawMaterialDto: CreateRawMaterialDto) {
    return this.rawMaterialsService.create(createRawMaterialDto);
  }

  @MessagePattern(RAW_MATERIAL_PATTERNS.LIST)
  findAll() {
    return this.rawMaterialsService.findAll();
  }

  @MessagePattern(RAW_MATERIAL_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.rawMaterialsService.findOne(id);
  }

  @MessagePattern(RAW_MATERIAL_PATTERNS.GET_BY_SUPPLIER)
  findBySupplierId(@Payload() supplierId: number) {
    return this.rawMaterialsService.findBySupplierId(supplierId);
  }

  @MessagePattern(RAW_MATERIAL_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateRawMaterialDto: UpdateRawMaterialDto }) {
    return this.rawMaterialsService.update(data.id, data.updateRawMaterialDto);
  }

  @MessagePattern(RAW_MATERIAL_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.rawMaterialsService.delete(id);
  }
}


import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SuppliersService } from './suppliers.service';
import { 
  SUPPLIER_PATTERNS,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@repo/shared';

@Controller()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @MessagePattern(SUPPLIER_PATTERNS.CREATE)
  create(@Payload() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @MessagePattern(SUPPLIER_PATTERNS.LIST)
  findAll() {
    return this.suppliersService.findAll();
  }

  @MessagePattern(SUPPLIER_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.suppliersService.findOne(id);
  }

  @MessagePattern(SUPPLIER_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateSupplierDto: UpdateSupplierDto }) {
    return this.suppliersService.update(data.id, data.updateSupplierDto);
  }

  @MessagePattern(SUPPLIER_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.suppliersService.delete(id);
  }
}


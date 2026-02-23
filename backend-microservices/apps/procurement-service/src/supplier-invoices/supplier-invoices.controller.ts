import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SupplierInvoicesService } from './supplier-invoices.service';
import { SUPPLIER_INVOICE_PATTERNS, CreateSupplierInvoiceDto, UpdateSupplierInvoiceDto } from '@repo/shared';

@Controller()
export class SupplierInvoicesController {
  constructor(private readonly service: SupplierInvoicesService) {}

  @MessagePattern(SUPPLIER_INVOICE_PATTERNS.CREATE)
  create(@Payload() dto: CreateSupplierInvoiceDto) {
    return this.service.create(dto);
  }

  @MessagePattern(SUPPLIER_INVOICE_PATTERNS.LIST)
  findAll() {
    return this.service.findAll();
  }

  @MessagePattern(SUPPLIER_INVOICE_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.service.findOne(id);
  }

  @MessagePattern(SUPPLIER_INVOICE_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateSupplierInvoiceDto }) {
    return this.service.update(data.id, data.updateDto);
  }

  @MessagePattern(SUPPLIER_INVOICE_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.service.delete(id);
  }
}

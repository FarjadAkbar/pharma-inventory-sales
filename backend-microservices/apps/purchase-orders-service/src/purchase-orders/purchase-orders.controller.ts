import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PurchaseOrdersService } from './purchase-orders.service';
import { 
  PURCHASE_ORDER_PATTERNS,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '@repo/shared';

@Controller()
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @MessagePattern(PURCHASE_ORDER_PATTERNS.CREATE)
  create(@Payload() createDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createDto);
  }

  @MessagePattern(PURCHASE_ORDER_PATTERNS.LIST)
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @MessagePattern(PURCHASE_ORDER_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.purchaseOrdersService.findOne(id);
  }

  @MessagePattern(PURCHASE_ORDER_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdatePurchaseOrderDto }) {
    return this.purchaseOrdersService.update(data.id, data.updateDto);
  }

  @MessagePattern(PURCHASE_ORDER_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.purchaseOrdersService.delete(id);
  }

  @MessagePattern(PURCHASE_ORDER_PATTERNS.APPROVE)
  approve(@Payload() id: number) {
    return this.purchaseOrdersService.approve(id);
  }

  @MessagePattern(PURCHASE_ORDER_PATTERNS.CANCEL)
  cancel(@Payload() id: number) {
    return this.purchaseOrdersService.cancel(id);
  }
}


import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShipmentsService } from './shipments.service';
import {
  SHIPMENT_PATTERNS,
  CreateShipmentDto,
  UpdateShipmentDto,
  AllocateStockDto,
  PickItemDto,
  PackItemDto,
  ShipOrderDto,
} from '@repo/shared';

@Controller()
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @MessagePattern(SHIPMENT_PATTERNS.CREATE)
  create(@Payload() createDto: CreateShipmentDto) {
    return this.shipmentsService.create(createDto);
  }

  @MessagePattern(SHIPMENT_PATTERNS.LIST)
  findAll(@Payload() params?: any) {
    return this.shipmentsService.findAll(params);
  }

  @MessagePattern(SHIPMENT_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.shipmentsService.findOne(id);
  }

  @MessagePattern(SHIPMENT_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateShipmentDto }) {
    return this.shipmentsService.update(data.id, data.updateDto);
  }

  @MessagePattern(SHIPMENT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.shipmentsService.delete(id);
  }

  @MessagePattern(SHIPMENT_PATTERNS.GET_BY_SALES_ORDER)
  getBySalesOrder(@Payload() salesOrderId: number) {
    return this.shipmentsService.getBySalesOrder(salesOrderId);
  }

  @MessagePattern(SHIPMENT_PATTERNS.ALLOCATE_STOCK)
  allocateStock(@Payload() allocateDto: AllocateStockDto) {
    return this.shipmentsService.allocateStock(allocateDto);
  }

  @MessagePattern(SHIPMENT_PATTERNS.PICK_ITEM)
  pickItem(@Payload() pickDto: PickItemDto) {
    return this.shipmentsService.pickItem(pickDto);
  }

  @MessagePattern(SHIPMENT_PATTERNS.PACK_ITEM)
  packItem(@Payload() packDto: PackItemDto) {
    return this.shipmentsService.packItem(packDto);
  }

  @MessagePattern(SHIPMENT_PATTERNS.SHIP_ORDER)
  shipOrder(@Payload() data: { id: number; shipDto: ShipOrderDto }) {
    return this.shipmentsService.shipOrder(data.id, data.shipDto);
  }

  @MessagePattern(SHIPMENT_PATTERNS.CANCEL)
  cancel(@Payload() id: number) {
    return this.shipmentsService.cancel(id);
  }
}


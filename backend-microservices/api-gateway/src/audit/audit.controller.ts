import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SALES_ORDER_PATTERNS, SHIPMENT_PATTERNS } from '@repo/shared';

@Controller('audit')
export class AuditController {
  constructor(
    @Inject('SALES_ORDER_SERVICE')
    private salesOrderClient: ClientProxy,
    @Inject('SHIPMENT_SERVICE')
    private shipmentClient: ClientProxy,
  ) {}

  @Get(':entityType/:entityId')
  async getEntityAuditHistory(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    const shipmentEntityTypes = new Set(['shipment', 'shipment_item', 'proof_of_delivery']);
    const client = shipmentEntityTypes.has(entityType) ? this.shipmentClient : this.salesOrderClient;
    const pattern = shipmentEntityTypes.has(entityType)
      ? SHIPMENT_PATTERNS.ENTITY_HISTORY
      : SALES_ORDER_PATTERNS.ENTITY_HISTORY;
    const result = await firstValueFrom(client.send(pattern, { entityType, entityId }));
    return { success: true, data: result };
  }
}


import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProofOfDeliveryService } from './proof-of-delivery.service';
import { PROOF_OF_DELIVERY_PATTERNS } from '@repo/shared';

@Controller()
export class ProofOfDeliveryController {
  constructor(private readonly podService: ProofOfDeliveryService) {}

  @MessagePattern(PROOF_OF_DELIVERY_PATTERNS.CREATE)
  create(@Payload() data: any) {
    return this.podService.create(data);
  }

  @MessagePattern(PROOF_OF_DELIVERY_PATTERNS.LIST)
  findAll(@Payload() params?: any) {
    return this.podService.findAll(params);
  }

  @MessagePattern(PROOF_OF_DELIVERY_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.podService.findOne(id);
  }

  @MessagePattern(PROOF_OF_DELIVERY_PATTERNS.GET_BY_SHIPMENT)
  getByShipment(@Payload() shipmentId: number) {
    return this.podService.getByShipment(shipmentId);
  }

  @MessagePattern(PROOF_OF_DELIVERY_PATTERNS.COMPLETE)
  complete(@Payload() data: { id: number; completedBy: number }) {
    return this.podService.complete(data.id, data.completedBy);
  }
}


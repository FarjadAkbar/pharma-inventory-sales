import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { POSService } from './pos.service';
import {
  POS_PATTERNS,
  CreatePOSTransactionDto,
  UpdatePOSTransactionDto,
  PaymentStatus,
  PaymentMethod,
  TransactionStatus,
} from '@repo/shared';

@Controller()
export class POSController {
  constructor(private readonly posService: POSService) {}

  @MessagePattern(POS_PATTERNS.CREATE)
  create(@Payload() createDto: CreatePOSTransactionDto) {
    return this.posService.create(createDto);
  }

  @MessagePattern(POS_PATTERNS.LIST)
  findAll(@Payload() params?: {
    search?: string;
    siteId?: number;
    cashierId?: number;
    customerId?: number;
    status?: TransactionStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    page?: number;
    limit?: number;
  }) {
    return this.posService.findAll(params);
  }

  @MessagePattern(POS_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.posService.findOne(id);
  }

  @MessagePattern(POS_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdatePOSTransactionDto }) {
    return this.posService.update(data.id, data.updateDto);
  }

  @MessagePattern(POS_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.posService.delete(id);
  }

  @MessagePattern(POS_PATTERNS.VOID)
  voidTransaction(@Payload() data: { id: number; voidedBy: number }) {
    return this.posService.voidTransaction(data.id, data.voidedBy);
  }

  @MessagePattern(POS_PATTERNS.REFUND)
  refundTransaction(@Payload() data: { id: number; refundedBy: number; amount?: number; reason?: string }) {
    return this.posService.refundTransaction(data.id, data);
  }
}

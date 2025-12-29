import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkOrdersService } from './work-orders.service';
import {
  MANUFACTURING_PATTERNS,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from '@repo/shared';

@Controller()
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @MessagePattern(MANUFACTURING_PATTERNS.WORK_ORDER_CREATE)
  create(@Payload() createDto: CreateWorkOrderDto) {
    return this.workOrdersService.create(createDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.WORK_ORDER_LIST)
  findAll() {
    return this.workOrdersService.findAll();
  }

  @MessagePattern(MANUFACTURING_PATTERNS.WORK_ORDER_GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.workOrdersService.findOne(id);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.WORK_ORDER_UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateWorkOrderDto }) {
    return this.workOrdersService.update(data.id, data.updateDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.WORK_ORDER_DELETE)
  delete(@Payload() id: number) {
    return this.workOrdersService.delete(id);
  }
}


import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderResponseDto,
  WorkOrderStatus,
} from '@repo/shared';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrdersRepository: Repository<WorkOrder>,
  ) {}

  async generateWorkOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `WO-${year}-`;
    
    const lastWorkOrder = await this.workOrdersRepository
      .createQueryBuilder('wo')
      .where('wo.workOrderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('wo.workOrderNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastWorkOrder) {
      const lastSequence = parseInt(lastWorkOrder.workOrderNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createDto: CreateWorkOrderDto): Promise<WorkOrderResponseDto> {
    const workOrderNumber = await this.generateWorkOrderNumber();

    const workOrder = this.workOrdersRepository.create({
      workOrderNumber,
      drugId: createDto.drugId,
      drugName: createDto.drugName,
      drugCode: createDto.drugCode,
      siteId: createDto.siteId,
      siteName: createDto.siteName,
      plannedQuantity: createDto.plannedQuantity,
      unit: createDto.unit,
      bomVersion: createDto.bomVersion,
      status: createDto.status || WorkOrderStatus.DRAFT,
      priority: createDto.priority,
      plannedStartDate: new Date(createDto.plannedStartDate),
      plannedEndDate: new Date(createDto.plannedEndDate),
      assignedTo: createDto.assignedTo,
      createdBy: createDto.createdBy,
      remarks: createDto.remarks,
    });

    const saved = await this.workOrdersRepository.save(workOrder);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<WorkOrderResponseDto[]> {
    const workOrders = await this.workOrdersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return workOrders.map(wo => this.toResponseDto(wo));
  }

  async findOne(id: number): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrdersRepository.findOne({ where: { id } });
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
    return this.toResponseDto(workOrder);
  }

  async update(id: number, updateDto: UpdateWorkOrderDto): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrdersRepository.findOne({ where: { id } });
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    Object.assign(workOrder, {
      ...updateDto,
      plannedStartDate: updateDto.plannedStartDate ? new Date(updateDto.plannedStartDate) : workOrder.plannedStartDate,
      plannedEndDate: updateDto.plannedEndDate ? new Date(updateDto.plannedEndDate) : workOrder.plannedEndDate,
      actualStartDate: updateDto.actualStartDate ? new Date(updateDto.actualStartDate) : workOrder.actualStartDate,
      actualEndDate: updateDto.actualEndDate ? new Date(updateDto.actualEndDate) : workOrder.actualEndDate,
    });

    const updated = await this.workOrdersRepository.save(workOrder);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const workOrder = await this.workOrdersRepository.findOne({ where: { id } });
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
    await this.workOrdersRepository.remove(workOrder);
  }

  private toResponseDto(workOrder: WorkOrder): WorkOrderResponseDto {
    return {
      id: workOrder.id,
      workOrderNumber: workOrder.workOrderNumber,
      drugId: workOrder.drugId,
      drugName: workOrder.drugName,
      drugCode: workOrder.drugCode,
      siteId: workOrder.siteId,
      siteName: workOrder.siteName,
      plannedQuantity: Number(workOrder.plannedQuantity),
      unit: workOrder.unit,
      bomVersion: workOrder.bomVersion,
      status: workOrder.status,
      priority: workOrder.priority,
      plannedStartDate: workOrder.plannedStartDate,
      plannedEndDate: workOrder.plannedEndDate,
      actualStartDate: workOrder.actualStartDate,
      actualEndDate: workOrder.actualEndDate,
      assignedTo: workOrder.assignedTo,
      assignedToName: undefined, // Would be populated from user service
      createdBy: workOrder.createdBy,
      createdByName: undefined, // Would be populated from user service
      remarks: workOrder.remarks,
      createdAt: workOrder.createdAt,
      updatedAt: workOrder.updatedAt,
    };
  }
}


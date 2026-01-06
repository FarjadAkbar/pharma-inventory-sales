import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { SalesOrder } from '../entities/sales-order.entity';
import { SalesOrderItem } from '../entities/sales-order-item.entity';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderResponseDto,
  SalesOrderItemResponseDto,
  SalesOrderStatus,
  DistributionPriority,
  SalesOrderItemStatus,
} from '@repo/shared';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrdersRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private salesOrderItemsRepository: Repository<SalesOrderItem>,
  ) {}

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SO-${year}-`;
    
    const lastOrder = await this.salesOrdersRepository
      .createQueryBuilder('so')
      .where('so.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('so.orderNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createDto: CreateSalesOrderDto): Promise<SalesOrderResponseDto> {
    const orderNumber = await this.generateOrderNumber();

    // Create sales order
    const salesOrder = this.salesOrdersRepository.create({
      orderNumber,
      accountId: createDto.accountId,
      accountName: createDto.accountName,
      accountCode: createDto.accountCode,
      siteId: createDto.siteId,
      siteName: createDto.siteName,
      requestedShipDate: new Date(createDto.requestedShipDate),
      status: SalesOrderStatus.DRAFT,
      priority: createDto.priority || DistributionPriority.NORMAL,
      totalAmount: createDto.totalAmount,
      currency: createDto.currency,
      specialInstructions: createDto.specialInstructions,
      shippingAddress: createDto.shippingAddress,
      billingAddress: createDto.billingAddress,
      createdBy: createDto.createdBy,
    });

    const savedOrder = await this.salesOrdersRepository.save(salesOrder);

    // Create order items
    if (createDto.items && createDto.items.length > 0) {
      const orderItems = createDto.items.map(item =>
        this.salesOrderItemsRepository.create({
          salesOrderId: savedOrder.id,
          drugId: item.drugId,
          drugName: item.drugName,
          drugCode: item.drugCode,
          batchPreference: item.batchPreference,
          preferredBatchId: item.preferredBatchId,
          preferredBatchNumber: item.preferredBatchNumber,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          allocatedQuantity: 0,
          status: SalesOrderItemStatus.PENDING,
          remarks: item.remarks,
        })
      );
      await this.salesOrderItemsRepository.save(orderItems);
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(params?: {
    search?: string;
    accountId?: number;
    siteId?: number;
    status?: SalesOrderStatus;
    priority?: DistributionPriority;
    page?: number;
    limit?: number;
  }): Promise<{ salesOrders: SalesOrderResponseDto[]; pagination: { page: number; pages: number; total: number } }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<SalesOrder> = {};
    
    if (params?.accountId) {
      where.accountId = params.accountId;
    }
    if (params?.siteId) {
      where.siteId = params.siteId;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.priority) {
      where.priority = params.priority;
    }

    const queryBuilder = this.salesOrdersRepository.createQueryBuilder('so');
    
    if (params?.search) {
      queryBuilder.andWhere(
        '(so.orderNumber LIKE :search OR so.accountName LIKE :search OR so.accountCode LIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    Object.keys(where).forEach(key => {
      queryBuilder.andWhere(`so.${key} = :${key}`, { [key]: where[key] });
    });

    queryBuilder.orderBy('so.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [salesOrders, total] = await queryBuilder
      .leftJoinAndSelect('so.items', 'items')
      .getManyAndCount();

    return {
      salesOrders: salesOrders.map(order => this.toResponseDto(order)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async findOne(id: number): Promise<SalesOrderResponseDto> {
    const salesOrder = await this.salesOrdersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }
    return this.toResponseDto(salesOrder);
  }

  async update(id: number, updateDto: UpdateSalesOrderDto): Promise<SalesOrderResponseDto> {
    const salesOrder = await this.salesOrdersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }

    // Prevent status changes that violate workflow
    if (updateDto.status) {
      const validTransitions = this.getValidStatusTransitions(salesOrder.status);
      if (!validTransitions.includes(updateDto.status)) {
        throw new BadRequestException(
          `Cannot change status from ${salesOrder.status} to ${updateDto.status}. Valid transitions: ${validTransitions.join(', ')}`
        );
      }
    }

    // Update sales order fields
    Object.assign(salesOrder, {
      ...updateDto,
      requestedShipDate: updateDto.requestedShipDate ? new Date(updateDto.requestedShipDate) : salesOrder.requestedShipDate,
      actualShipDate: updateDto.actualShipDate ? new Date(updateDto.actualShipDate) : salesOrder.actualShipDate,
      deliveryDate: updateDto.deliveryDate ? new Date(updateDto.deliveryDate) : salesOrder.deliveryDate,
    });

    // Update items if provided
    if (updateDto.items) {
      // Delete existing items
      await this.salesOrderItemsRepository.delete({ salesOrderId: id });

      // Create new items
      const orderItems = updateDto.items.map(item =>
        this.salesOrderItemsRepository.create({
          salesOrderId: id,
          drugId: item.drugId,
          drugName: item.drugName,
          drugCode: item.drugCode,
          batchPreference: item.batchPreference,
          preferredBatchId: item.preferredBatchId,
          preferredBatchNumber: item.preferredBatchNumber,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          allocatedQuantity: 0,
          status: SalesOrderItemStatus.PENDING,
          remarks: item.remarks,
        })
      );
      await this.salesOrderItemsRepository.save(orderItems);
    }

    const updated = await this.salesOrdersRepository.save(salesOrder);
    return this.findOne(updated.id);
  }

  async approve(id: number, approvedBy: number): Promise<SalesOrderResponseDto> {
    const salesOrder = await this.salesOrdersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }

    if (salesOrder.status !== SalesOrderStatus.DRAFT && salesOrder.status !== SalesOrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Cannot approve sales order. Current status: ${salesOrder.status}`);
    }

    salesOrder.status = SalesOrderStatus.APPROVED;
    salesOrder.approvedBy = approvedBy;
    salesOrder.approvedAt = new Date();

    const updated = await this.salesOrdersRepository.save(salesOrder);
    return this.toResponseDto(updated);
  }

  async cancel(id: number): Promise<SalesOrderResponseDto> {
    const salesOrder = await this.salesOrdersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }

    if (salesOrder.status === SalesOrderStatus.SHIPPED || salesOrder.status === SalesOrderStatus.DELIVERED) {
      throw new BadRequestException(`Cannot cancel sales order. Current status: ${salesOrder.status}`);
    }

    salesOrder.status = SalesOrderStatus.CANCELLED;
    const updated = await this.salesOrdersRepository.save(salesOrder);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const salesOrder = await this.salesOrdersRepository.findOne({ where: { id } });
    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    }

    if (salesOrder.status !== SalesOrderStatus.DRAFT && salesOrder.status !== SalesOrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot delete sales order. Current status: ${salesOrder.status}`);
    }

    await this.salesOrdersRepository.remove(salesOrder);
  }

  private getValidStatusTransitions(currentStatus: SalesOrderStatus): SalesOrderStatus[] {
    const transitions: Record<SalesOrderStatus, SalesOrderStatus[]> = {
      [SalesOrderStatus.DRAFT]: [SalesOrderStatus.PENDING_APPROVAL, SalesOrderStatus.CANCELLED],
      [SalesOrderStatus.PENDING_APPROVAL]: [SalesOrderStatus.APPROVED, SalesOrderStatus.CANCELLED],
      [SalesOrderStatus.APPROVED]: [SalesOrderStatus.IN_PROGRESS, SalesOrderStatus.CANCELLED],
      [SalesOrderStatus.IN_PROGRESS]: [SalesOrderStatus.ALLOCATED, SalesOrderStatus.CANCELLED],
      [SalesOrderStatus.ALLOCATED]: [SalesOrderStatus.PICKED, SalesOrderStatus.CANCELLED],
      [SalesOrderStatus.PICKED]: [SalesOrderStatus.SHIPPED, SalesOrderStatus.CANCELLED],
      [SalesOrderStatus.SHIPPED]: [SalesOrderStatus.DELIVERED, SalesOrderStatus.RETURNED],
      [SalesOrderStatus.DELIVERED]: [SalesOrderStatus.RETURNED],
      [SalesOrderStatus.CANCELLED]: [],
      [SalesOrderStatus.RETURNED]: [],
    };
    return transitions[currentStatus] || [];
  }

  private toResponseDto(salesOrder: SalesOrder): SalesOrderResponseDto {
    return {
      id: salesOrder.id,
      orderNumber: salesOrder.orderNumber,
      accountId: salesOrder.accountId,
      accountName: salesOrder.accountName,
      accountCode: salesOrder.accountCode,
      siteId: salesOrder.siteId,
      siteName: salesOrder.siteName,
      requestedShipDate: salesOrder.requestedShipDate,
      actualShipDate: salesOrder.actualShipDate,
      deliveryDate: salesOrder.deliveryDate,
      status: salesOrder.status,
      priority: salesOrder.priority,
      totalAmount: Number(salesOrder.totalAmount),
      currency: salesOrder.currency,
      specialInstructions: salesOrder.specialInstructions,
      items: (salesOrder.items || []).map(item => ({
        id: item.id,
        salesOrderId: item.salesOrderId,
        drugId: item.drugId,
        drugName: item.drugName,
        drugCode: item.drugCode,
        batchPreference: item.batchPreference,
        preferredBatchId: item.preferredBatchId,
        preferredBatchNumber: item.preferredBatchNumber,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        allocatedQuantity: Number(item.allocatedQuantity),
        status: item.status,
        remarks: item.remarks,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      shippingAddress: salesOrder.shippingAddress,
      billingAddress: salesOrder.billingAddress,
      createdBy: salesOrder.createdBy,
      createdByName: undefined, // Would be populated from user service
      createdAt: salesOrder.createdAt,
      updatedAt: salesOrder.updatedAt,
      approvedBy: salesOrder.approvedBy,
      approvedByName: undefined, // Would be populated from user service
      approvedAt: salesOrder.approvedAt,
      remarks: salesOrder.remarks,
    };
  }
}


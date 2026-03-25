import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Shipment } from '../entities/shipment.entity';
import { ShipmentItem } from '../entities/shipment-item.entity';
import { ProofOfDelivery } from '../entities/proof-of-delivery.entity';
import { AuditLog, AuditService, StatusHistory } from '@repo/shared';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  ShipmentResponseDto,
  ShipmentItemResponseDto,
  ShipmentStatus,
  ShipmentItemStatus,
  DistributionPriority,
  AllocateStockDto,
  PickItemDto,
  PackItemDto,
  ShipOrderDto,
  SALES_ORDER_PATTERNS,
  WAREHOUSE_PATTERNS,
  InventoryStatus,
  SalesOrderStatus,
  ErrorCode,
} from '@repo/shared';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentsRepository: Repository<Shipment>,
    @InjectRepository(ShipmentItem)
    private shipmentItemsRepository: Repository<ShipmentItem>,
    @InjectRepository(ProofOfDelivery)
    private podRepository: Repository<ProofOfDelivery>,
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
    @InjectRepository(StatusHistory)
    private statusHistoryRepository: Repository<StatusHistory>,
    private auditService: AuditService,
    @Inject('SALES_ORDER_SERVICE')
    private salesOrderClient: ClientProxy,
    @Inject('WAREHOUSE_SERVICE')
    private warehouseClient: ClientProxy,
  ) {}

  async generateShipmentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SH-${year}-`;
    
    const lastShipment = await this.shipmentsRepository
      .createQueryBuilder('s')
      .where('s.shipmentNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('s.shipmentNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastShipment) {
      const lastSequence = parseInt(lastShipment.shipmentNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async generatePODNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `POD-${year}-`;
    
    const lastPOD = await this.podRepository
      .createQueryBuilder('pod')
      .where('pod.podNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('pod.podNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastPOD) {
      const lastSequence = parseInt(lastPOD.podNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  /** Canonical lines from approved sales order for tamper checks & default shipment lines. */
  private snapshotLinesFromSalesOrder(salesOrder: any): { drugId: number; quantity: number }[] {
    const items = salesOrder?.items ?? [];
    return items.map((i: any) => ({ drugId: Number(i.drugId), quantity: Number(i.quantity) }));
  }

  private sortLineTuples(lines: { drugId: number; quantity: number }[]): string {
    const sorted = [...lines].sort((a, b) => a.drugId - b.drugId || a.quantity - b.quantity);
    return JSON.stringify(sorted);
  }

  private assertClientPayloadMatchesSalesOrder(createDto: CreateShipmentDto, salesOrder: any): void {
    if (createDto.salesOrderNumber != null && createDto.salesOrderNumber !== salesOrder.orderNumber) {
      throw new BadRequestException('salesOrderNumber does not match the sales order record');
    }
    if (createDto.accountId != null && Number(createDto.accountId) !== Number(salesOrder.accountId)) {
      throw new BadRequestException('accountId does not match the sales order');
    }
    if (createDto.siteId != null && Number(createDto.siteId) !== Number(salesOrder.siteId)) {
      throw new BadRequestException('siteId does not match the sales order');
    }
    if (createDto.items?.length) {
      const fromSo = this.snapshotLinesFromSalesOrder(salesOrder);
      const fromClient = createDto.items.map(i => ({ drugId: Number(i.drugId), quantity: Number(i.quantity) }));
      if (this.sortLineTuples(fromSo) !== this.sortLineTuples(fromClient)) {
        throw new BadRequestException(
          'Shipment line quantities must match the approved sales order lines (drugId + quantity)',
        );
      }
    }
  }

  private shippingAddressFromSalesOrder(salesOrder: any) {
    const a = salesOrder.shippingAddress ?? {};
    return {
      street: a.street ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
      postalCode: a.postalCode ?? '',
      country: a.country ?? '',
      contactPerson: a.contactPerson ?? '',
      phone: a.phone ?? '',
      email: a.email ?? '',
      deliveryInstructions: a.deliveryInstructions,
      coordinates: a.coordinates,
    };
  }

  async create(createDto: CreateShipmentDto): Promise<ShipmentResponseDto> {
    const payload = createDto as any;
    this.auditService.setContext(payload.createdBy, payload.createdByName, payload.correlationId, 'shipment-service');
    const rawSalesOrder = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.GET_BY_ID, createDto.salesOrderId),
    );

    const salesOrder: any = (rawSalesOrder as any)?.data ?? rawSalesOrder;

    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${createDto.salesOrderId} not found`);
    }

    if (salesOrder.status !== SalesOrderStatus.APPROVED) {
      throw new BadRequestException(
        `Sales order must be approved to create shipment. Current status: ${salesOrder.status}`,
      );
    }

    this.assertClientPayloadMatchesSalesOrder(createDto, salesOrder);

    const soItems = salesOrder.items ?? [];
    if (!Array.isArray(soItems) || soItems.length === 0) {
      throw new BadRequestException('Sales order has no lines; cannot create shipment');
    }

    const shipmentNumber = await this.generateShipmentNumber();

    const priority =
      createDto.priority ?? salesOrder.priority ?? DistributionPriority.NORMAL;

    const createdBy = createDto.createdBy;
    if (createdBy == null || !Number.isFinite(Number(createdBy)) || Number(createdBy) < 1) {
      throw new BadRequestException('createdBy (actor user id) is required');
    }

    const shipment = this.shipmentsRepository.create({
      shipmentNumber,
      salesOrderId: createDto.salesOrderId,
      salesOrderNumber: salesOrder.orderNumber,
      accountId: salesOrder.accountId,
      accountName: salesOrder.accountName,
      siteId: salesOrder.siteId,
      siteName: salesOrder.siteName,
      status: ShipmentStatus.DRAFT,
      priority,
      shipmentDate: new Date(createDto.shipmentDate),
      expectedDeliveryDate: new Date(createDto.expectedDeliveryDate),
      carrier: createDto.carrier,
      serviceType: createDto.serviceType,
      shippingAddress: this.shippingAddressFromSalesOrder(salesOrder),
      packagingInstructions: createDto.packagingInstructions,
      specialHandling: createDto.specialHandling,
      temperatureRequirements: createDto.temperatureRequirements,
      createdBy: Number(createdBy),
      remarks: createDto.remarks,
    });

    const savedShipment = await this.shipmentsRepository.save(shipment);
    await this.recordStatusTransition('shipment', savedShipment.id, null, ShipmentStatus.DRAFT, Number(createdBy), 'Shipment created');

    const shipmentItems = soItems.map((line: any) =>
      this.shipmentItemsRepository.create({
        shipmentId: savedShipment.id,
        drugId: line.drugId,
        drugName: line.drugName,
        drugCode: line.drugCode,
        batchNumber: line.preferredBatchNumber ?? '',
        quantity: line.quantity,
        unit: line.unit,
        location: undefined,
        pickedQuantity: 0,
        packedQuantity: 0,
        status: ShipmentItemStatus.PENDING,
        remarks: line.remarks,
      }),
    );
    await this.shipmentItemsRepository.save(shipmentItems);

    return this.findOne(savedShipment.id);
  }

  async findAll(params?: {
    search?: string;
    salesOrderId?: number;
    accountId?: number;
    siteId?: number;
    status?: ShipmentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: ShipmentResponseDto[]; total: number; page: number; limit: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    const empty = { data: [], total: 0, page: 1, limit };

    try {
      const where: FindOptionsWhere<Shipment> = {};
      if (params?.salesOrderId) where.salesOrderId = params.salesOrderId;
      if (params?.accountId) where.accountId = params.accountId;
      if (params?.siteId) where.siteId = params.siteId;
      if (params?.status) where.status = params.status;

      if (params?.search) {
        const searchTerm = `%${params.search}%`;
        const searchResults = await this.shipmentsRepository
          .createQueryBuilder('s')
          .leftJoinAndSelect('s.items', 'items')
          .where('s.shipmentNumber LIKE :search', { search: searchTerm })
          .orWhere('s.salesOrderNumber LIKE :search', { search: searchTerm })
          .orWhere('s.accountName LIKE :search', { search: searchTerm })
          .orWhere('s.trackingNumber LIKE :search', { search: searchTerm })
          .skip(skip)
          .take(limit)
          .orderBy('s.createdAt', 'DESC')
          .getManyAndCount();
        return {
          data: searchResults[0].map(s => this.toResponseDto(s)),
          total: searchResults[1],
          page,
          limit,
        };
      }

      const [shipments, total] = await this.shipmentsRepository.findAndCount({
        where,
        relations: ['items'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return { data: shipments.map(s => this.toResponseDto(s)), total, page, limit };
    } catch (err) {
      if (err instanceof QueryFailedError && err.message?.includes('does not exist')) {
        return { ...empty, limit };
      }
      throw err;
    }
  }

  async findOne(id: number): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['items', 'proofOfDeliveries'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return this.toResponseDto(shipment);
  }

  async update(id: number, updateDto: UpdateShipmentDto): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    const payload = updateDto as any;
    this.auditService.setContext(
      Number(payload.updatedBy ?? shipment.createdBy),
      payload.updatedByName,
      payload.correlationId,
      'shipment-service',
    );

    if (shipment.status === ShipmentStatus.SHIPPED || shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException(`Cannot update shipment. Current status: ${shipment.status}`);
    }

    if (updateDto.shipmentDate) shipment.shipmentDate = new Date(updateDto.shipmentDate);
    if (updateDto.expectedDeliveryDate) shipment.expectedDeliveryDate = new Date(updateDto.expectedDeliveryDate);
    if (updateDto.actualDeliveryDate) shipment.actualDeliveryDate = new Date(updateDto.actualDeliveryDate);
    if (updateDto.trackingNumber) shipment.trackingNumber = updateDto.trackingNumber;
    if (updateDto.carrier) shipment.carrier = updateDto.carrier;
    if (updateDto.serviceType) shipment.serviceType = updateDto.serviceType;
    const previousStatus = shipment.status;
    if (updateDto.status) shipment.status = updateDto.status;
    if (updateDto.remarks !== undefined) shipment.remarks = updateDto.remarks;

    const updated = await this.shipmentsRepository.save(shipment);
    if (updateDto.status && updateDto.status !== previousStatus) {
      await this.recordStatusTransition('shipment', updated.id, previousStatus, updateDto.status, shipment.createdBy, 'Status changed via update');
    }
    return this.toResponseDto(updated);
  }

  async allocateStock(allocateDto: AllocateStockDto): Promise<ShipmentItemResponseDto> {
    this.auditService.setContext(Number(allocateDto.allocatedBy), undefined, (allocateDto as any).correlationId, 'shipment-service');
    const shipmentItem = await this.shipmentItemsRepository.findOne({
      where: { id: allocateDto.shipmentItemId },
      relations: ['shipment'],
    });

    if (!shipmentItem) {
      throw new NotFoundException(`Shipment item with ID ${allocateDto.shipmentItemId} not found`);
    }

    if (shipmentItem.shipment.status !== ShipmentStatus.DRAFT && shipmentItem.shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(`Cannot allocate stock. Shipment status: ${shipmentItem.shipment.status}`);
    }

    // Get inventory item from warehouse service
    const inventory = await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_GET_BY_ID, allocateDto.inventoryId)
    );

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${allocateDto.inventoryId} not found`);
    }

    if (inventory.status !== InventoryStatus.AVAILABLE) {
      throw new BadRequestException(`Inventory item is not available. Status: ${inventory.status}`);
    }

    if (inventory.quantity < allocateDto.quantity) {
      throw new RpcException({
        code: ErrorCode.STOCK_INSUFFICIENT,
        message: `Insufficient inventory. Available: ${inventory.quantity}, Requested: ${allocateDto.quantity}`,
        details: {
          available: inventory.quantity,
          requested: allocateDto.quantity,
          inventoryId: allocateDto.inventoryId,
        },
      });
    }

    if (!inventory.qaReleaseId) {
      throw new RpcException({
        code: ErrorCode.BATCH_NOT_RELEASED,
        message: 'Cannot allocate inventory that is not QA released',
        details: {
          inventoryId: allocateDto.inventoryId,
          qaReleaseId: inventory.qaReleaseId ?? null,
        },
      });
    }

    // Reserve inventory (update status to RESERVED)
    await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_UPDATE, {
        id: allocateDto.inventoryId,
        updateDto: {
          status: InventoryStatus.RESERVED,
        },
      })
    );

    // Update shipment item
    shipmentItem.location = inventory.locationId || inventory.location?.id?.toString();
    const previousItemStatus = shipmentItem.status;
    shipmentItem.status = ShipmentItemStatus.ALLOCATED;

    const updated = await this.shipmentItemsRepository.save(shipmentItem);
    await this.recordStatusTransition(
      'shipment_item',
      updated.id,
      previousItemStatus,
      ShipmentItemStatus.ALLOCATED,
      allocateDto.allocatedBy,
      'Allocated from inventory',
    );

    // Update shipment status if all items are allocated
    await this.updateShipmentStatusIfNeeded(shipmentItem.shipmentId);

    return this.toItemResponseDto(updated);
  }

  async pickItem(pickDto: PickItemDto): Promise<ShipmentItemResponseDto> {
    this.auditService.setContext(Number(pickDto.pickedBy), undefined, (pickDto as any).correlationId, 'shipment-service');
    const shipmentItem = await this.shipmentItemsRepository.findOne({
      where: { id: pickDto.shipmentItemId },
      relations: ['shipment'],
    });

    if (!shipmentItem) {
      throw new NotFoundException(`Shipment item with ID ${pickDto.shipmentItemId} not found`);
    }

    if (shipmentItem.status !== ShipmentItemStatus.ALLOCATED) {
      throw new BadRequestException(`Item must be allocated before picking. Current status: ${shipmentItem.status}`);
    }

    if (pickDto.pickedQuantity > shipmentItem.quantity) {
      throw new BadRequestException(`Picked quantity cannot exceed ordered quantity`);
    }

    if (pickDto.pickedBy == null) {
      throw new BadRequestException('pickedBy (actor user id) is required');
    }
    const previousItemStatus = shipmentItem.status;
    shipmentItem.pickedQuantity = pickDto.pickedQuantity;
    shipmentItem.pickedBy = pickDto.pickedBy;
    shipmentItem.pickedAt = new Date();

    if (pickDto.pickedQuantity === shipmentItem.quantity) {
      shipmentItem.status = ShipmentItemStatus.PICKED;
    }

    const updated = await this.shipmentItemsRepository.save(shipmentItem);
    if (updated.status !== previousItemStatus) {
      await this.recordStatusTransition(
        'shipment_item',
        updated.id,
        previousItemStatus,
        updated.status,
        pickDto.pickedBy,
        'Picked item',
      );
    }

    // Update shipment status if all items are picked
    await this.updateShipmentStatusIfNeeded(shipmentItem.shipmentId);

    return this.toItemResponseDto(updated);
  }

  async packItem(packDto: PackItemDto): Promise<ShipmentItemResponseDto> {
    this.auditService.setContext(Number(packDto.packedBy), undefined, (packDto as any).correlationId, 'shipment-service');
    const shipmentItem = await this.shipmentItemsRepository.findOne({
      where: { id: packDto.shipmentItemId },
      relations: ['shipment'],
    });

    if (!shipmentItem) {
      throw new NotFoundException(`Shipment item with ID ${packDto.shipmentItemId} not found`);
    }

    if (shipmentItem.status !== ShipmentItemStatus.PICKED) {
      throw new BadRequestException(`Item must be picked before packing. Current status: ${shipmentItem.status}`);
    }

    if (packDto.packedQuantity > shipmentItem.pickedQuantity) {
      throw new BadRequestException(`Packed quantity cannot exceed picked quantity`);
    }

    if (packDto.packedBy == null) {
      throw new BadRequestException('packedBy (actor user id) is required');
    }
    const previousItemStatus = shipmentItem.status;
    shipmentItem.packedQuantity = packDto.packedQuantity;
    shipmentItem.packedBy = packDto.packedBy;
    shipmentItem.packedAt = new Date();

    if (packDto.packedQuantity === shipmentItem.pickedQuantity) {
      shipmentItem.status = ShipmentItemStatus.PACKED;
    }

    const updated = await this.shipmentItemsRepository.save(shipmentItem);
    if (updated.status !== previousItemStatus) {
      await this.recordStatusTransition(
        'shipment_item',
        updated.id,
        previousItemStatus,
        updated.status,
        packDto.packedBy,
        'Packed item',
      );
    }

    // Update shipment status if all items are packed
    await this.updateShipmentStatusIfNeeded(shipmentItem.shipmentId);

    return this.toItemResponseDto(updated);
  }

  async shipOrder(id: number, shipDto: ShipOrderDto): Promise<ShipmentResponseDto> {
    this.auditService.setContext(Number(shipDto.shippedBy), undefined, (shipDto as any).correlationId, 'shipment-service');
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    // Check if all items are packed
    const allPacked = shipment.items.every(item => item.status === ShipmentItemStatus.PACKED);
    if (!allPacked) {
      throw new BadRequestException('All items must be packed before shipping');
    }

    const previousStatus = shipment.status;
    shipment.status = ShipmentStatus.SHIPPED;
    if (shipDto.trackingNumber) shipment.trackingNumber = shipDto.trackingNumber;
    if (shipDto.carrier) shipment.carrier = shipDto.carrier;
    if (shipDto.serviceType) shipment.serviceType = shipDto.serviceType;
    if (shipDto.shipmentDate) shipment.shipmentDate = new Date(shipDto.shipmentDate);

    // Update all items to SHIPPED
    shipment.items.forEach(item => {
      const old = item.status;
      item.status = ShipmentItemStatus.SHIPPED;
    });

    await this.shipmentItemsRepository.save(shipment.items);
    await Promise.all(
      shipment.items.map(item =>
        this.recordStatusTransition(
          'shipment_item',
          item.id,
          ShipmentItemStatus.PACKED,
          ShipmentItemStatus.SHIPPED,
          shipDto.shippedBy,
          'Shipment shipped',
        ),
      ),
    );
    const updated = await this.shipmentsRepository.save(shipment);
    await this.recordStatusTransition('shipment', updated.id, previousStatus, ShipmentStatus.SHIPPED, shipDto.shippedBy, 'Shipment shipped');

    // Update sales order status to SHIPPED
    await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.UPDATE, {
        id: shipment.salesOrderId,
        updateDto: { status: 'Shipped' },
      })
    );

    return this.toResponseDto(updated);
  }

  async cancel(id: number): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    this.auditService.setContext(shipment.createdBy, undefined, undefined, 'shipment-service');

    if (shipment.status === ShipmentStatus.SHIPPED || shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException(`Cannot cancel shipment. Current status: ${shipment.status}`);
    }

    const previousStatus = shipment.status;
    shipment.status = ShipmentStatus.CANCELLED;
    const updated = await this.shipmentsRepository.save(shipment);
    await this.recordStatusTransition('shipment', updated.id, previousStatus, ShipmentStatus.CANCELLED, shipment.createdBy, 'Shipment cancelled');

    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    this.auditService.setContext(shipment.createdBy, undefined, undefined, 'shipment-service');

    if (shipment.status === ShipmentStatus.SHIPPED || shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException(`Cannot delete shipment. Current status: ${shipment.status}`);
    }

    await this.shipmentsRepository.remove(shipment);
    return { success: true };
  }

  async getHistory(id: number) {
    const shipment = await this.shipmentsRepository.findOne({ where: { id } });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    const itemIds = (await this.shipmentItemsRepository.find({ where: { shipmentId: id }, select: ['id'] })).map(i => i.id);
    const [audit, shipmentStatusHistory, itemStatusHistory] = await Promise.all([
      this.auditLogsRepository
        .createQueryBuilder('a')
        .where('(a.entityType = :shipmentType AND a.entityId = :shipmentId)', {
          shipmentType: 'shipment',
          shipmentId: id,
        })
        .orWhere(
          itemIds.length
            ? '(a.entityType = :itemType AND a.entityId IN (:...itemIds))'
            : '(1 = 0)',
          { itemType: 'shipment_item', itemIds: itemIds.length ? itemIds : [-1] },
        )
        .orderBy('a.createdAt', 'DESC')
        .getMany(),
      this.statusHistoryRepository.find({
        where: { entityType: 'shipment', entityId: id },
        order: { changedAt: 'DESC' },
      }),
      this.statusHistoryRepository
        .createQueryBuilder('h')
        .where('h.entityType = :entityType', { entityType: 'shipment_item' })
        .andWhere(
          'h.entityId IN (:...itemIds)',
          { itemIds: itemIds.length ? itemIds : [-1] },
        )
        .orderBy('h.changedAt', 'DESC')
        .getMany(),
    ]);
    return { audit, shipmentStatusHistory, itemStatusHistory };
  }

  async getEntityHistory(entityType: string, entityId: number) {
    const [audit, statusHistory] = await Promise.all([
      this.auditLogsRepository.find({
        where: { entityType, entityId },
        order: { createdAt: 'DESC' },
      }),
      this.statusHistoryRepository.find({
        where: { entityType, entityId },
        order: { changedAt: 'DESC' },
      }),
    ]);
    return { audit, statusHistory };
  }

  private async recordStatusTransition(
    entityType: 'shipment' | 'shipment_item',
    entityId: number,
    fromStatus: string | null,
    toStatus: string,
    changedBy?: number,
    reason?: string,
  ) {
    await this.statusHistoryRepository.save(
      this.statusHistoryRepository.create({
        entityType,
        entityId,
        fromStatus,
        toStatus,
        changedBy,
        reason,
      }),
    );
  }

  async getBySalesOrder(salesOrderId: number): Promise<ShipmentResponseDto[]> {
    const shipments = await this.shipmentsRepository.find({
      where: { salesOrderId },
      relations: ['items', 'proofOfDeliveries'],
      order: { createdAt: 'DESC' },
    });

    return shipments.map(s => this.toResponseDto(s));
  }

  private async updateShipmentStatusIfNeeded(shipmentId: number): Promise<void> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id: shipmentId },
      relations: ['items'],
    });

    if (!shipment || !shipment.items || shipment.items.length === 0) return;

    const allAllocated = shipment.items.every(item => item.status === ShipmentItemStatus.ALLOCATED || item.status === ShipmentItemStatus.PICKED || item.status === ShipmentItemStatus.PACKED);
    const allPicked = shipment.items.every(item => item.status === ShipmentItemStatus.PICKED || item.status === ShipmentItemStatus.PACKED);
    const allPacked = shipment.items.every(item => item.status === ShipmentItemStatus.PACKED);

    if (allPacked && shipment.status === ShipmentStatus.ALLOCATED) {
      shipment.status = ShipmentStatus.PACKED;
      await this.shipmentsRepository.save(shipment);
    } else if (allPicked && shipment.status === ShipmentStatus.ALLOCATED) {
      shipment.status = ShipmentStatus.PICKED;
      await this.shipmentsRepository.save(shipment);
    } else if (allAllocated && shipment.status === ShipmentStatus.DRAFT || shipment.status === ShipmentStatus.PENDING) {
      shipment.status = ShipmentStatus.ALLOCATED;
      await this.shipmentsRepository.save(shipment);
    }
  }

  private toResponseDto(shipment: Shipment): ShipmentResponseDto {
    return {
      id: shipment.id,
      shipmentNumber: shipment.shipmentNumber,
      salesOrderId: shipment.salesOrderId,
      salesOrderNumber: shipment.salesOrderNumber,
      accountId: shipment.accountId,
      accountName: shipment.accountName,
      siteId: shipment.siteId,
      siteName: shipment.siteName,
      status: shipment.status,
      priority: shipment.priority,
      shipmentDate: shipment.shipmentDate,
      expectedDeliveryDate: shipment.expectedDeliveryDate,
      actualDeliveryDate: shipment.actualDeliveryDate,
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      serviceType: shipment.serviceType,
      items: shipment.items?.map(item => this.toItemResponseDto(item)) || [],
      shippingAddress: shipment.shippingAddress,
      packagingInstructions: shipment.packagingInstructions,
      specialHandling: shipment.specialHandling,
      temperatureRequirements: shipment.temperatureRequirements,
      createdBy: shipment.createdBy,
      createdByName: shipment.createdByName,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
      remarks: shipment.remarks,
    };
  }

  private toItemResponseDto(item: ShipmentItem): ShipmentItemResponseDto {
    return {
      id: item.id,
      shipmentId: item.shipmentId,
      drugId: item.drugId,
      drugName: item.drugName,
      drugCode: item.drugCode,
      batchNumber: item.batchNumber,
      quantity: parseFloat(item.quantity.toString()),
      unit: item.unit,
      location: item.location,
      pickedQuantity: parseFloat(item.pickedQuantity.toString()),
      packedQuantity: parseFloat(item.packedQuantity.toString()),
      status: item.status,
      pickedBy: item.pickedBy,
      pickedByName: item.pickedByName,
      pickedAt: item.pickedAt,
      packedBy: item.packedBy,
      packedByName: item.packedByName,
      packedAt: item.packedAt,
      remarks: item.remarks,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}


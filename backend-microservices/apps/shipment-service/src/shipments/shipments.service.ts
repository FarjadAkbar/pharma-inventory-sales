import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, In } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Shipment } from '../entities/shipment.entity';
import { ShipmentItem } from '../entities/shipment-item.entity';
import { ProofOfDelivery } from '../entities/proof-of-delivery.entity';
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

  async create(createDto: CreateShipmentDto): Promise<ShipmentResponseDto> {
    // Verify sales order exists and is approved
    const salesOrder = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.GET_BY_ID, createDto.salesOrderId)
    );

    if (!salesOrder) {
      throw new NotFoundException(`Sales order with ID ${createDto.salesOrderId} not found`);
    }

    if (salesOrder.status !== 'Approved') {
      throw new BadRequestException(`Sales order must be approved to create shipment. Current status: ${salesOrder.status}`);
    }

    const shipmentNumber = await this.generateShipmentNumber();

    // Create shipment
    const shipment = this.shipmentsRepository.create({
      shipmentNumber,
      salesOrderId: createDto.salesOrderId,
      salesOrderNumber: createDto.salesOrderNumber,
      accountId: createDto.accountId,
      accountName: createDto.accountName,
      siteId: createDto.siteId,
      siteName: createDto.siteName,
      status: ShipmentStatus.DRAFT,
      priority: createDto.priority || DistributionPriority.NORMAL,
      shipmentDate: new Date(createDto.shipmentDate),
      expectedDeliveryDate: new Date(createDto.expectedDeliveryDate),
      carrier: createDto.carrier,
      serviceType: createDto.serviceType,
      shippingAddress: createDto.shippingAddress,
      packagingInstructions: createDto.packagingInstructions,
      specialHandling: createDto.specialHandling,
      temperatureRequirements: createDto.temperatureRequirements,
      createdBy: createDto.createdBy,
      remarks: createDto.remarks,
    });

    const savedShipment = await this.shipmentsRepository.save(shipment);

    // Create shipment items
    if (createDto.items && createDto.items.length > 0) {
      const shipmentItems = createDto.items.map(item =>
        this.shipmentItemsRepository.create({
          shipmentId: savedShipment.id,
          drugId: item.drugId,
          drugName: item.drugName,
          drugCode: item.drugCode,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          unit: item.unit,
          location: item.location,
          pickedQuantity: 0,
          packedQuantity: 0,
          status: ShipmentItemStatus.PENDING,
          remarks: item.remarks,
        })
      );
      await this.shipmentItemsRepository.save(shipmentItems);
    }

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

    const where: FindOptionsWhere<Shipment> = {};
    if (params?.salesOrderId) where.salesOrderId = params.salesOrderId;
    if (params?.accountId) where.accountId = params.accountId;
    if (params?.siteId) where.siteId = params.siteId;
    if (params?.status) where.status = params.status;

    const [shipments, total] = await this.shipmentsRepository.findAndCount({
      where,
      relations: ['items'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

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

    return {
      data: shipments.map(s => this.toResponseDto(s)),
      total,
      page,
      limit,
    };
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

    if (shipment.status === ShipmentStatus.SHIPPED || shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException(`Cannot update shipment. Current status: ${shipment.status}`);
    }

    if (updateDto.shipmentDate) shipment.shipmentDate = new Date(updateDto.shipmentDate);
    if (updateDto.expectedDeliveryDate) shipment.expectedDeliveryDate = new Date(updateDto.expectedDeliveryDate);
    if (updateDto.actualDeliveryDate) shipment.actualDeliveryDate = new Date(updateDto.actualDeliveryDate);
    if (updateDto.trackingNumber) shipment.trackingNumber = updateDto.trackingNumber;
    if (updateDto.carrier) shipment.carrier = updateDto.carrier;
    if (updateDto.serviceType) shipment.serviceType = updateDto.serviceType;
    if (updateDto.status) shipment.status = updateDto.status;
    if (updateDto.remarks !== undefined) shipment.remarks = updateDto.remarks;

    const updated = await this.shipmentsRepository.save(shipment);
    return this.toResponseDto(updated);
  }

  async allocateStock(allocateDto: AllocateStockDto): Promise<ShipmentItemResponseDto> {
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
      throw new BadRequestException(`Insufficient inventory. Available: ${inventory.quantity}, Requested: ${allocateDto.quantity}`);
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
    shipmentItem.status = ShipmentItemStatus.ALLOCATED;

    const updated = await this.shipmentItemsRepository.save(shipmentItem);

    // Update shipment status if all items are allocated
    await this.updateShipmentStatusIfNeeded(shipmentItem.shipmentId);

    return this.toItemResponseDto(updated);
  }

  async pickItem(pickDto: PickItemDto): Promise<ShipmentItemResponseDto> {
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

    shipmentItem.pickedQuantity = pickDto.pickedQuantity;
    shipmentItem.pickedBy = pickDto.pickedBy;
    shipmentItem.pickedAt = new Date();

    if (pickDto.pickedQuantity === shipmentItem.quantity) {
      shipmentItem.status = ShipmentItemStatus.PICKED;
    }

    const updated = await this.shipmentItemsRepository.save(shipmentItem);

    // Update shipment status if all items are picked
    await this.updateShipmentStatusIfNeeded(shipmentItem.shipmentId);

    return this.toItemResponseDto(updated);
  }

  async packItem(packDto: PackItemDto): Promise<ShipmentItemResponseDto> {
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

    shipmentItem.packedQuantity = packDto.packedQuantity;
    shipmentItem.packedBy = packDto.packedBy;
    shipmentItem.packedAt = new Date();

    if (packDto.packedQuantity === shipmentItem.pickedQuantity) {
      shipmentItem.status = ShipmentItemStatus.PACKED;
    }

    const updated = await this.shipmentItemsRepository.save(shipmentItem);

    // Update shipment status if all items are packed
    await this.updateShipmentStatusIfNeeded(shipmentItem.shipmentId);

    return this.toItemResponseDto(updated);
  }

  async shipOrder(id: number, shipDto: ShipOrderDto): Promise<ShipmentResponseDto> {
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

    shipment.status = ShipmentStatus.SHIPPED;
    if (shipDto.trackingNumber) shipment.trackingNumber = shipDto.trackingNumber;
    if (shipDto.carrier) shipment.carrier = shipDto.carrier;
    if (shipDto.serviceType) shipment.serviceType = shipDto.serviceType;
    if (shipDto.shipmentDate) shipment.shipmentDate = new Date(shipDto.shipmentDate);

    // Update all items to SHIPPED
    shipment.items.forEach(item => {
      item.status = ShipmentItemStatus.SHIPPED;
    });

    await this.shipmentItemsRepository.save(shipment.items);
    const updated = await this.shipmentsRepository.save(shipment);

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

    if (shipment.status === ShipmentStatus.SHIPPED || shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException(`Cannot cancel shipment. Current status: ${shipment.status}`);
    }

    shipment.status = ShipmentStatus.CANCELLED;
    const updated = await this.shipmentsRepository.save(shipment);

    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    if (shipment.status === ShipmentStatus.SHIPPED || shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException(`Cannot delete shipment. Current status: ${shipment.status}`);
    }

    await this.shipmentsRepository.remove(shipment);
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


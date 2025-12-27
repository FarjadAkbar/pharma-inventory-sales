import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { 
  InventoryItem, 
  StockMovement, 
  PutawayItem, 
  MaterialIssue,
  Warehouse,
  StorageLocation,
  CycleCount,
  TemperatureLog,
  LabelBarcode,
} from '../entities';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryItemResponseDto,
  InventoryStatus,
  CreateStockMovementDto,
  StockMovementResponseDto,
  StockMovementType,
  CreatePutawayItemDto,
  AssignPutawayLocationDto,
  PutawayItemResponseDto,
  PutawayStatus,
  CreateMaterialIssueDto,
  ApproveMaterialIssueDto,
  MaterialIssueResponseDto,
  MaterialIssueStatus,
  VerifyInventoryDto,
  VerifyInventoryResponseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseResponseDto,
  WarehouseType,
  WarehouseStatus,
  CreateStorageLocationDto,
  UpdateStorageLocationDto,
  StorageLocationResponseDto,
  LocationType,
  LocationStatus,
  CreateCycleCountDto,
  UpdateCycleCountDto,
  CycleCountResponseDto,
  CycleCountStatus,
  CycleCountType,
  CreateTemperatureLogDto,
  TemperatureLogResponseDto,
  TemperatureLogType,
  TemperatureStatus,
  CreateLabelBarcodeDto,
  UpdateLabelBarcodeDto,
  PrintLabelBarcodeDto,
  LabelBarcodeResponseDto,
  LabelType,
  BarcodeType,
  WAREHOUSE_PATTERNS,
} from '@repo/shared';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(PutawayItem)
    private putawayRepository: Repository<PutawayItem>,
    @InjectRepository(MaterialIssue)
    private materialIssueRepository: Repository<MaterialIssue>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(StorageLocation)
    private storageLocationRepository: Repository<StorageLocation>,
    @InjectRepository(CycleCount)
    private cycleCountRepository: Repository<CycleCount>,
    @InjectRepository(TemperatureLog)
    private temperatureLogRepository: Repository<TemperatureLog>,
    @InjectRepository(LabelBarcode)
    private labelBarcodeRepository: Repository<LabelBarcode>,
    @Inject('QUALITY_ASSURANCE_SERVICE')
    private qualityAssuranceClient: ClientProxy,
    private dataSource: DataSource,
  ) {}

  // ========== Inventory Management ==========

  async generateItemCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    const lastItem = await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.itemCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('item.itemCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastItem) {
      const lastSequence = parseInt(lastItem.itemCode.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async createInventoryItem(createDto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    const itemCode = await this.generateItemCode();

    const inventoryItem = this.inventoryRepository.create({
      itemCode,
      materialId: createDto.materialId,
      materialName: createDto.materialName,
      materialCode: createDto.materialCode,
      batchNumber: createDto.batchNumber,
      quantity: createDto.quantity,
      unit: createDto.unit,
      locationId: createDto.locationId,
      zone: createDto.zone,
      rack: createDto.rack,
      shelf: createDto.shelf,
      position: createDto.position,
      status: createDto.status || InventoryStatus.AVAILABLE,
      expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
      temperature: createDto.temperature,
      humidity: createDto.humidity,
      goodsReceiptItemId: createDto.goodsReceiptItemId,
      qaReleaseId: createDto.qaReleaseId,
      remarks: createDto.remarks,
      lastUpdated: new Date(),
    });

    const saved = await this.inventoryRepository.save(inventoryItem);

    // Create stock movement for receipt
    await this.createStockMovement({
      movementType: StockMovementType.RECEIPT,
      materialId: createDto.materialId,
      materialName: createDto.materialName,
      materialCode: createDto.materialCode,
      batchNumber: createDto.batchNumber,
      quantity: createDto.quantity,
      unit: createDto.unit,
      toLocationId: createDto.locationId,
      referenceId: saved.id.toString(),
      referenceType: 'InventoryItem',
      remarks: `Inventory item created: ${itemCode}`,
      performedBy: createDto.goodsReceiptItemId ? 1 : 0, // System or user
    });

    return this.toInventoryResponseDto(saved);
  }

  async findAllInventory(params?: {
    materialId?: number;
    batchNumber?: string;
    status?: InventoryStatus;
    locationId?: string;
  }): Promise<InventoryItemResponseDto[]> {
    const query = this.inventoryRepository.createQueryBuilder('item');

    if (params?.materialId) {
      query.andWhere('item.materialId = :materialId', { materialId: params.materialId });
    }
    if (params?.batchNumber) {
      query.andWhere('item.batchNumber = :batchNumber', { batchNumber: params.batchNumber });
    }
    if (params?.status) {
      query.andWhere('item.status = :status', { status: params.status });
    }
    if (params?.locationId) {
      query.andWhere('item.locationId = :locationId', { locationId: params.locationId });
    }

    // FEFO: Order by expiry date (earliest first)
    query.orderBy('item.expiryDate', 'ASC', 'NULLS LAST');
    query.addOrderBy('item.createdAt', 'ASC');

    const items = await query.getMany();
    return items.map(item => this.toInventoryResponseDto(item));
  }

  async findInventoryById(id: number): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return this.toInventoryResponseDto(item);
  }

  async updateInventoryItem(id: number, updateDto: UpdateInventoryItemDto): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    // Track location changes
    const locationChanged = updateDto.locationId && updateDto.locationId !== item.locationId;

    Object.assign(item, {
      ...updateDto,
      expiryDate: updateDto.expiryDate ? new Date(updateDto.expiryDate) : item.expiryDate,
      lastUpdated: new Date(),
      lastUpdatedBy: updateDto.lastUpdatedBy,
    });

    const updated = await this.inventoryRepository.save(item);

    // Create movement if location changed
    if (locationChanged) {
      await this.createStockMovement({
        movementType: StockMovementType.TRANSFER,
        materialId: item.materialId,
        materialName: item.materialName,
        materialCode: item.materialCode,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        unit: item.unit,
        fromLocationId: item.locationId,
        toLocationId: updateDto.locationId,
        referenceId: id.toString(),
        referenceType: 'InventoryItem',
        remarks: 'Location transfer',
        performedBy: updateDto.lastUpdatedBy || 0,
      });
    }

    return this.toInventoryResponseDto(updated);
  }

  async verifyInventory(verifyDto: VerifyInventoryDto): Promise<VerifyInventoryResponseDto> {
    const item = await this.inventoryRepository.findOne({ where: { id: verifyDto.inventoryItemId } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const discrepancies: any = {};

    // Check quantity
    if (verifyDto.verifiedQuantity !== undefined && verifyDto.verifiedQuantity !== item.quantity) {
      discrepancies.quantityDifference = verifyDto.verifiedQuantity - item.quantity;
      item.quantity = verifyDto.verifiedQuantity;
    }

    // Check location
    if (verifyDto.locationId && verifyDto.locationId !== item.locationId) {
      discrepancies.locationMismatch = true;
      item.locationId = verifyDto.locationId;
    }

    item.lastUpdated = new Date();
    item.lastUpdatedBy = verifyDto.verifiedBy;
    await this.inventoryRepository.save(item);

    return {
      id: Date.now(), // Verification record ID
      inventoryItemId: verifyDto.inventoryItemId,
      verifiedQuantity: verifyDto.verifiedQuantity,
      locationId: verifyDto.locationId,
      locationVerified: verifyDto.locationVerified,
      remarks: verifyDto.remarks,
      verifiedBy: verifyDto.verifiedBy,
      verifiedAt: new Date(),
      discrepancies: Object.keys(discrepancies).length > 0 ? discrepancies : undefined,
    };
  }

  async deleteInventoryItem(id: number): Promise<void> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    await this.inventoryRepository.remove(item);
  }

  // ========== Stock Movements ==========

  async generateMovementNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MOV-${year}-`;
    
    const lastMovement = await this.stockMovementRepository
      .createQueryBuilder('movement')
      .where('movement.movementNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('movement.movementNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastMovement) {
      const lastSequence = parseInt(lastMovement.movementNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async createStockMovement(createDto: CreateStockMovementDto): Promise<StockMovementResponseDto> {
    const movementNumber = await this.generateMovementNumber();

    const movement = this.stockMovementRepository.create({
      movementNumber,
      movementType: createDto.movementType,
      materialId: createDto.materialId,
      materialName: createDto.materialName,
      materialCode: createDto.materialCode,
      batchNumber: createDto.batchNumber,
      quantity: createDto.quantity,
      unit: createDto.unit,
      fromLocationId: createDto.fromLocationId,
      toLocationId: createDto.toLocationId,
      referenceId: createDto.referenceId,
      referenceType: createDto.referenceType,
      remarks: createDto.remarks,
      performedBy: createDto.performedBy,
      performedAt: new Date(),
    });

    const saved = await this.stockMovementRepository.save(movement);
    return this.toStockMovementResponseDto(saved);
  }

  async findAllMovements(params?: {
    materialId?: number;
    batchNumber?: string;
    movementType?: StockMovementType;
    referenceId?: string;
  }): Promise<StockMovementResponseDto[]> {
    const query = this.stockMovementRepository.createQueryBuilder('movement');

    if (params?.materialId) {
      query.andWhere('movement.materialId = :materialId', { materialId: params.materialId });
    }
    if (params?.batchNumber) {
      query.andWhere('movement.batchNumber = :batchNumber', { batchNumber: params.batchNumber });
    }
    if (params?.movementType) {
      query.andWhere('movement.movementType = :movementType', { movementType: params.movementType });
    }
    if (params?.referenceId) {
      query.andWhere('movement.referenceId = :referenceId', { referenceId: params.referenceId });
    }

    query.orderBy('movement.performedAt', 'DESC');

    const movements = await query.getMany();
    return movements.map(movement => this.toStockMovementResponseDto(movement));
  }

  async findMovementById(id: number): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementRepository.findOne({ where: { id } });
    if (!movement) {
      throw new NotFoundException('Stock movement not found');
    }
    return this.toStockMovementResponseDto(movement);
  }

  // ========== Putaway Management ==========

  async generatePutawayNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PUT-${year}-`;
    
    const lastPutaway = await this.putawayRepository
      .createQueryBuilder('putaway')
      .where('putaway.putawayNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('putaway.putawayNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastPutaway) {
      const lastSequence = parseInt(lastPutaway.putawayNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async createPutawayItem(createDto: CreatePutawayItemDto): Promise<PutawayItemResponseDto> {
    const putawayNumber = await this.generatePutawayNumber();

    const putawayItem = this.putawayRepository.create({
      putawayNumber,
      materialId: createDto.materialId,
      materialName: createDto.materialName,
      materialCode: createDto.materialCode,
      batchNumber: createDto.batchNumber,
      quantity: createDto.quantity,
      unit: createDto.unit,
      status: PutawayStatus.PENDING,
      goodsReceiptItemId: createDto.goodsReceiptItemId,
      qaReleaseId: createDto.qaReleaseId,
      requestedBy: createDto.requestedBy,
      requestedAt: new Date(),
      remarks: createDto.remarks,
    });

    const saved = await this.putawayRepository.save(putawayItem);
    return this.toPutawayResponseDto(saved);
  }

  async findAllPutawayItems(params?: {
    status?: PutawayStatus;
    qaReleaseId?: number;
  }): Promise<PutawayItemResponseDto[]> {
    const query = this.putawayRepository.createQueryBuilder('putaway');

    if (params?.status) {
      query.andWhere('putaway.status = :status', { status: params.status });
    }
    if (params?.qaReleaseId) {
      query.andWhere('putaway.qaReleaseId = :qaReleaseId', { qaReleaseId: params.qaReleaseId });
    }

    query.orderBy('putaway.requestedAt', 'ASC');

    const items = await query.getMany();
    return items.map(item => this.toPutawayResponseDto(item));
  }

  async findPutawayById(id: number): Promise<PutawayItemResponseDto> {
    const item = await this.putawayRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Putaway item not found');
    }
    return this.toPutawayResponseDto(item);
  }

  async assignPutawayLocation(id: number, assignDto: AssignPutawayLocationDto): Promise<PutawayItemResponseDto> {
    const item = await this.putawayRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Putaway item not found');
    }

    if (item.status !== PutawayStatus.PENDING && item.status !== PutawayStatus.ASSIGNED) {
      throw new BadRequestException('Can only assign location to pending or assigned putaway items');
    }

    item.status = PutawayStatus.ASSIGNED;
    item.locationId = assignDto.locationId;
    item.zone = assignDto.zone;
    item.rack = assignDto.rack;
    item.shelf = assignDto.shelf;
    item.position = assignDto.position;
    item.temperature = assignDto.temperature;
    item.humidity = assignDto.humidity;
    item.assignedBy = assignDto.assignedBy;
    item.assignedAt = new Date();
    if (assignDto.remarks) {
      item.remarks = item.remarks 
        ? `${item.remarks}\n\nLocation assigned: ${assignDto.remarks}`
        : assignDto.remarks;
    }

    const updated = await this.putawayRepository.save(item);
    return this.toPutawayResponseDto(updated);
  }

  async completePutaway(id: number, completedBy: number): Promise<PutawayItemResponseDto> {
    const item = await this.putawayRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Putaway item not found');
    }

    if (item.status !== PutawayStatus.ASSIGNED && item.status !== PutawayStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only complete assigned or in-progress putaway items');
    }

    item.status = PutawayStatus.COMPLETED;
    item.completedBy = completedBy;
    item.completedAt = new Date();

    const updated = await this.putawayRepository.save(item);

    // Create inventory item from putaway
    await this.createInventoryItem({
      materialId: item.materialId,
      materialName: item.materialName,
      materialCode: item.materialCode,
      batchNumber: item.batchNumber,
      quantity: item.quantity,
      unit: item.unit,
      locationId: item.locationId,
      zone: item.zone,
      rack: item.rack,
      shelf: item.shelf,
      position: item.position,
      status: InventoryStatus.AVAILABLE,
      temperature: item.temperature,
      humidity: item.humidity,
      goodsReceiptItemId: item.goodsReceiptItemId,
      qaReleaseId: item.qaReleaseId,
      remarks: `Stored from putaway: ${item.putawayNumber}`,
    });

    return this.toPutawayResponseDto(updated);
  }

  // ========== Material Issue ==========

  async generateIssueNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ISS-${year}-`;
    
    const lastIssue = await this.materialIssueRepository
      .createQueryBuilder('issue')
      .where('issue.issueNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('issue.issueNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastIssue) {
      const lastSequence = parseInt(lastIssue.issueNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async createMaterialIssue(createDto: CreateMaterialIssueDto): Promise<MaterialIssueResponseDto> {
    // Check available inventory
    const availableItems = await this.inventoryRepository.find({
      where: {
        materialId: createDto.materialId,
        batchNumber: createDto.batchNumber || undefined,
        status: InventoryStatus.AVAILABLE,
      },
      order: {
        expiryDate: 'ASC', // FEFO
      },
    });

    const totalAvailable = availableItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    if (totalAvailable < createDto.quantity) {
      throw new BadRequestException(`Insufficient inventory. Available: ${totalAvailable}, Requested: ${createDto.quantity}`);
    }

    const issueNumber = await this.generateIssueNumber();

    const materialIssue = this.materialIssueRepository.create({
      issueNumber,
      materialId: createDto.materialId,
      materialName: createDto.materialName,
      materialCode: createDto.materialCode,
      batchNumber: createDto.batchNumber,
      quantity: createDto.quantity,
      unit: createDto.unit,
      fromLocationId: createDto.fromLocationId,
      toLocationId: createDto.toLocationId,
      workOrderId: createDto.workOrderId,
      batchId: createDto.batchId,
      referenceId: createDto.referenceId,
      referenceType: createDto.referenceType,
      status: MaterialIssueStatus.PENDING,
      requestedBy: createDto.requestedBy,
      requestedAt: new Date(),
      remarks: createDto.remarks,
    });

    const saved = await this.materialIssueRepository.save(materialIssue);
    return this.toMaterialIssueResponseDto(saved);
  }

  async findAllMaterialIssues(params?: {
    status?: MaterialIssueStatus;
    workOrderId?: string;
    batchId?: string;
  }): Promise<MaterialIssueResponseDto[]> {
    const query = this.materialIssueRepository.createQueryBuilder('issue');

    if (params?.status) {
      query.andWhere('issue.status = :status', { status: params.status });
    }
    if (params?.workOrderId) {
      query.andWhere('issue.workOrderId = :workOrderId', { workOrderId: params.workOrderId });
    }
    if (params?.batchId) {
      query.andWhere('issue.batchId = :batchId', { batchId: params.batchId });
    }

    query.orderBy('issue.requestedAt', 'DESC');

    const issues = await query.getMany();
    return issues.map(issue => this.toMaterialIssueResponseDto(issue));
  }

  async findMaterialIssueById(id: number): Promise<MaterialIssueResponseDto> {
    const issue = await this.materialIssueRepository.findOne({ where: { id } });
    if (!issue) {
      throw new NotFoundException('Material issue not found');
    }
    return this.toMaterialIssueResponseDto(issue);
  }

  async approveMaterialIssue(id: number, approveDto: ApproveMaterialIssueDto): Promise<MaterialIssueResponseDto> {
    const issue = await this.materialIssueRepository.findOne({ where: { id } });
    if (!issue) {
      throw new NotFoundException('Material issue not found');
    }

    if (issue.status !== MaterialIssueStatus.PENDING) {
      throw new BadRequestException('Can only approve pending material issues');
    }

    issue.status = MaterialIssueStatus.APPROVED;
    issue.approvedBy = approveDto.approvedBy;
    issue.approvedAt = new Date();
    if (approveDto.remarks) {
      issue.remarks = issue.remarks 
        ? `${issue.remarks}\n\nApproved: ${approveDto.remarks}`
        : approveDto.remarks;
    }

    const updated = await this.materialIssueRepository.save(issue);
    return this.toMaterialIssueResponseDto(updated);
  }

  async pickMaterialIssue(id: number, pickedBy: number): Promise<MaterialIssueResponseDto> {
    const issue = await this.materialIssueRepository.findOne({ where: { id } });
    if (!issue) {
      throw new NotFoundException('Material issue not found');
    }

    if (issue.status !== MaterialIssueStatus.APPROVED) {
      throw new BadRequestException('Can only pick approved material issues');
    }

    // Get available inventory (FEFO)
    const availableItems = await this.inventoryRepository.find({
      where: {
        materialId: issue.materialId,
        batchNumber: issue.batchNumber || undefined,
        status: InventoryStatus.AVAILABLE,
      },
      order: {
        expiryDate: 'ASC',
      },
    });

    let remainingQuantity = issue.quantity;
    const itemsToUpdate: InventoryItem[] = [];

    for (const item of availableItems) {
      if (remainingQuantity <= 0) break;

      const itemQuantity = Number(item.quantity);
      if (itemQuantity <= remainingQuantity) {
        // Reserve entire item
        item.status = InventoryStatus.RESERVED;
        itemsToUpdate.push(item);
        remainingQuantity -= itemQuantity;
      } else {
        // Partial reservation - would need to split item (simplified for now)
        item.status = InventoryStatus.RESERVED;
        itemsToUpdate.push(item);
        remainingQuantity = 0;
      }
    }

    if (remainingQuantity > 0) {
      throw new BadRequestException(`Insufficient inventory for picking. Remaining: ${remainingQuantity}`);
    }

    await this.inventoryRepository.save(itemsToUpdate);

    issue.status = MaterialIssueStatus.PICKED;
    issue.pickedBy = pickedBy;
    issue.pickedAt = new Date();

    const updated = await this.materialIssueRepository.save(issue);
    return this.toMaterialIssueResponseDto(updated);
  }

  async issueMaterial(id: number, issuedBy: number): Promise<MaterialIssueResponseDto> {
    const issue = await this.materialIssueRepository.findOne({ where: { id } });
    if (!issue) {
      throw new NotFoundException('Material issue not found');
    }

    if (issue.status !== MaterialIssueStatus.PICKED) {
      throw new BadRequestException('Can only issue picked materials');
    }

    // Get reserved items
    const reservedItems = await this.inventoryRepository.find({
      where: {
        materialId: issue.materialId,
        batchNumber: issue.batchNumber || undefined,
        status: InventoryStatus.RESERVED,
      },
    });

    let remainingQuantity = issue.quantity;

    for (const item of reservedItems) {
      if (remainingQuantity <= 0) break;

      const itemQuantity = Number(item.quantity);
      if (itemQuantity <= remainingQuantity) {
        // Consume entire item
        await this.createStockMovement({
          movementType: StockMovementType.CONSUMPTION,
          materialId: issue.materialId,
          materialName: issue.materialName,
          materialCode: issue.materialCode,
          batchNumber: issue.batchNumber,
          quantity: itemQuantity,
          unit: issue.unit,
          fromLocationId: item.locationId,
          referenceId: issue.id.toString(),
          referenceType: 'MaterialIssue',
          remarks: `Material issued: ${issue.issueNumber}`,
          performedBy: issuedBy,
        });

        await this.inventoryRepository.remove(item);
        remainingQuantity -= itemQuantity;
      } else {
        // Partial consumption
        item.quantity = itemQuantity - remainingQuantity;
        item.status = InventoryStatus.AVAILABLE;
        await this.inventoryRepository.save(item);

        await this.createStockMovement({
          movementType: StockMovementType.CONSUMPTION,
          materialId: issue.materialId,
          materialName: issue.materialName,
          materialCode: issue.materialCode,
          batchNumber: issue.batchNumber,
          quantity: remainingQuantity,
          unit: issue.unit,
          fromLocationId: item.locationId,
          referenceId: issue.id.toString(),
          referenceType: 'MaterialIssue',
          remarks: `Material issued: ${issue.issueNumber}`,
          performedBy: issuedBy,
        });

        remainingQuantity = 0;
      }
    }

    issue.status = MaterialIssueStatus.ISSUED;
    issue.issuedBy = issuedBy;
    issue.issuedAt = new Date();

    const updated = await this.materialIssueRepository.save(issue);
    return this.toMaterialIssueResponseDto(updated);
  }

  // ========== Helper Methods ==========

  private toInventoryResponseDto(item: InventoryItem): InventoryItemResponseDto {
    return {
      id: item.id,
      itemCode: item.itemCode,
      materialId: item.materialId,
      materialName: item.materialName,
      materialCode: item.materialCode,
      batchNumber: item.batchNumber,
      quantity: Number(item.quantity),
      unit: item.unit,
      locationId: item.locationId,
      zone: item.zone,
      rack: item.rack,
      shelf: item.shelf,
      position: item.position,
      status: item.status,
      expiryDate: item.expiryDate,
      temperature: item.temperature ? Number(item.temperature) : undefined,
      humidity: item.humidity ? Number(item.humidity) : undefined,
      goodsReceiptItemId: item.goodsReceiptItemId,
      qaReleaseId: item.qaReleaseId,
      remarks: item.remarks,
      lastUpdated: item.lastUpdated,
      lastUpdatedBy: item.lastUpdatedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toStockMovementResponseDto(movement: StockMovement): StockMovementResponseDto {
    return {
      id: movement.id,
      movementNumber: movement.movementNumber,
      movementType: movement.movementType,
      materialId: movement.materialId,
      materialName: movement.materialName,
      materialCode: movement.materialCode,
      batchNumber: movement.batchNumber,
      quantity: Number(movement.quantity),
      unit: movement.unit,
      fromLocationId: movement.fromLocationId,
      toLocationId: movement.toLocationId,
      referenceId: movement.referenceId,
      referenceType: movement.referenceType,
      remarks: movement.remarks,
      performedBy: movement.performedBy,
      performedAt: movement.performedAt,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
    };
  }

  private toPutawayResponseDto(item: PutawayItem): PutawayItemResponseDto {
    return {
      id: item.id,
      putawayNumber: item.putawayNumber,
      materialId: item.materialId,
      materialName: item.materialName,
      materialCode: item.materialCode,
      batchNumber: item.batchNumber,
      quantity: Number(item.quantity),
      unit: item.unit,
      status: item.status,
      locationId: item.locationId,
      zone: item.zone,
      rack: item.rack,
      shelf: item.shelf,
      position: item.position,
      temperature: item.temperature ? Number(item.temperature) : undefined,
      humidity: item.humidity ? Number(item.humidity) : undefined,
      goodsReceiptItemId: item.goodsReceiptItemId,
      qaReleaseId: item.qaReleaseId,
      requestedBy: item.requestedBy,
      requestedAt: item.requestedAt,
      assignedBy: item.assignedBy,
      assignedAt: item.assignedAt,
      completedBy: item.completedBy,
      completedAt: item.completedAt,
      remarks: item.remarks,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toMaterialIssueResponseDto(issue: MaterialIssue): MaterialIssueResponseDto {
    return {
      id: issue.id,
      issueNumber: issue.issueNumber,
      materialId: issue.materialId,
      materialName: issue.materialName,
      materialCode: issue.materialCode,
      batchNumber: issue.batchNumber,
      quantity: Number(issue.quantity),
      unit: issue.unit,
      fromLocationId: issue.fromLocationId,
      toLocationId: issue.toLocationId,
      workOrderId: issue.workOrderId,
      batchId: issue.batchId,
      referenceId: issue.referenceId,
      referenceType: issue.referenceType,
      status: issue.status,
      requestedBy: issue.requestedBy,
      requestedAt: issue.requestedAt,
      approvedBy: issue.approvedBy,
      approvedAt: issue.approvedAt,
      pickedBy: issue.pickedBy,
      pickedAt: issue.pickedAt,
      issuedBy: issue.issuedBy,
      issuedAt: issue.issuedAt,
      remarks: issue.remarks,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }

  // ========== Warehouse Management ==========

  async createWarehouse(dto: CreateWarehouseDto): Promise<WarehouseResponseDto> {
    const existing = await this.warehouseRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Warehouse with code ${dto.code} already exists`);
    }

    const warehouse = this.warehouseRepository.create({
      ...dto,
      type: dto.type || WarehouseType.MAIN,
      status: dto.status || WarehouseStatus.ACTIVE,
    });

    const saved = await this.warehouseRepository.save(warehouse);
    return this.toWarehouseResponseDto(saved);
  }

  async findAllWarehouses(filters?: { siteId?: number; status?: WarehouseStatus; type?: WarehouseType }): Promise<WarehouseResponseDto[]> {
    const query = this.warehouseRepository.createQueryBuilder('warehouse');

    if (filters?.siteId) {
      query.andWhere('warehouse.siteId = :siteId', { siteId: filters.siteId });
    }
    if (filters?.status) {
      query.andWhere('warehouse.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      query.andWhere('warehouse.type = :type', { type: filters.type });
    }

    const warehouses = await query.getMany();
    return warehouses.map(w => this.toWarehouseResponseDto(w));
  }

  async findWarehouseById(id: number): Promise<WarehouseResponseDto> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return this.toWarehouseResponseDto(warehouse);
  }

  async updateWarehouse(id: number, dto: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    Object.assign(warehouse, dto);
    const updated = await this.warehouseRepository.save(warehouse);
    return this.toWarehouseResponseDto(updated);
  }

  async deleteWarehouse(id: number): Promise<void> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // Check if warehouse has locations
    const locationCount = await this.storageLocationRepository.count({ where: { warehouseId: id } });
    if (locationCount > 0) {
      throw new BadRequestException('Cannot delete warehouse with existing storage locations');
    }

    await this.warehouseRepository.remove(warehouse);
  }

  private toWarehouseResponseDto(warehouse: Warehouse): WarehouseResponseDto {
    return {
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      description: warehouse.description,
      type: warehouse.type,
      status: warehouse.status,
      siteId: warehouse.siteId,
      address: warehouse.address,
      city: warehouse.city,
      state: warehouse.state,
      country: warehouse.country,
      postalCode: warehouse.postalCode,
      minTemperature: warehouse.minTemperature ? Number(warehouse.minTemperature) : undefined,
      maxTemperature: warehouse.maxTemperature ? Number(warehouse.maxTemperature) : undefined,
      minHumidity: warehouse.minHumidity ? Number(warehouse.minHumidity) : undefined,
      maxHumidity: warehouse.maxHumidity ? Number(warehouse.maxHumidity) : undefined,
      managerId: warehouse.managerId,
      remarks: warehouse.remarks,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  // ========== Storage Location Management ==========

  async createStorageLocation(dto: CreateStorageLocationDto): Promise<StorageLocationResponseDto> {
    const existing = await this.storageLocationRepository.findOne({ where: { locationCode: dto.locationCode } });
    if (existing) {
      throw new BadRequestException(`Storage location with code ${dto.locationCode} already exists`);
    }

    const warehouse = await this.warehouseRepository.findOne({ where: { id: dto.warehouseId } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${dto.warehouseId} not found`);
    }

    const location = this.storageLocationRepository.create({
      ...dto,
      type: dto.type || LocationType.BIN,
      status: dto.status || LocationStatus.AVAILABLE,
      requiresTemperatureControl: dto.requiresTemperatureControl ?? false,
      requiresHumidityControl: dto.requiresHumidityControl ?? false,
    });

    const saved = await this.storageLocationRepository.save(location);
    return this.toStorageLocationResponseDto(saved);
  }

  async findAllStorageLocations(filters?: { warehouseId?: number; status?: LocationStatus; type?: LocationType }): Promise<StorageLocationResponseDto[]> {
    const query = this.storageLocationRepository.createQueryBuilder('location');

    if (filters?.warehouseId) {
      query.andWhere('location.warehouseId = :warehouseId', { warehouseId: filters.warehouseId });
    }
    if (filters?.status) {
      query.andWhere('location.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      query.andWhere('location.type = :type', { type: filters.type });
    }

    const locations = await query.getMany();
    return locations.map(l => this.toStorageLocationResponseDto(l));
  }

  async findStorageLocationById(id: number): Promise<StorageLocationResponseDto> {
    const location = await this.storageLocationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Storage location with ID ${id} not found`);
    }
    return this.toStorageLocationResponseDto(location);
  }

  async updateStorageLocation(id: number, dto: UpdateStorageLocationDto): Promise<StorageLocationResponseDto> {
    const location = await this.storageLocationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Storage location with ID ${id} not found`);
    }

    Object.assign(location, dto);
    const updated = await this.storageLocationRepository.save(location);
    return this.toStorageLocationResponseDto(updated);
  }

  async deleteStorageLocation(id: number): Promise<void> {
    const location = await this.storageLocationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Storage location with ID ${id} not found`);
    }

    // Check if location is occupied
    if (location.status === LocationStatus.OCCUPIED) {
      throw new BadRequestException('Cannot delete occupied storage location');
    }

    await this.storageLocationRepository.remove(location);
  }

  private toStorageLocationResponseDto(location: StorageLocation): StorageLocationResponseDto {
    return {
      id: location.id,
      locationCode: location.locationCode,
      warehouseId: location.warehouseId,
      name: location.name,
      type: location.type,
      status: location.status,
      zone: location.zone,
      aisle: location.aisle,
      rack: location.rack,
      shelf: location.shelf,
      position: location.position,
      capacity: location.capacity ? Number(location.capacity) : undefined,
      capacityUnit: location.capacityUnit,
      minTemperature: location.minTemperature ? Number(location.minTemperature) : undefined,
      maxTemperature: location.maxTemperature ? Number(location.maxTemperature) : undefined,
      minHumidity: location.minHumidity ? Number(location.minHumidity) : undefined,
      maxHumidity: location.maxHumidity ? Number(location.maxHumidity) : undefined,
      requiresTemperatureControl: location.requiresTemperatureControl,
      requiresHumidityControl: location.requiresHumidityControl,
      remarks: location.remarks,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }

  // ========== Cycle Count Management ==========

  async generateCountNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CC-${year}-`;
    
    const lastCount = await this.cycleCountRepository
      .createQueryBuilder('count')
      .where('count.countNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('count.countNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastCount) {
      const lastSeq = parseInt(lastCount.countNumber.split('-')[2] || '0', 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async createCycleCount(dto: CreateCycleCountDto): Promise<CycleCountResponseDto> {
    const countNumber = await this.generateCountNumber();

    const cycleCount = this.cycleCountRepository.create({
      ...dto,
      countNumber,
      countType: dto.countType || CycleCountType.FULL,
      status: CycleCountStatus.PLANNED,
      scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
    });

    const saved = await this.cycleCountRepository.save(cycleCount);
    return this.toCycleCountResponseDto(saved);
  }

  async findAllCycleCounts(filters?: { warehouseId?: number; status?: CycleCountStatus; countType?: CycleCountType }): Promise<CycleCountResponseDto[]> {
    const query = this.cycleCountRepository.createQueryBuilder('count');

    if (filters?.warehouseId) {
      query.andWhere('count.warehouseId = :warehouseId', { warehouseId: filters.warehouseId });
    }
    if (filters?.status) {
      query.andWhere('count.status = :status', { status: filters.status });
    }
    if (filters?.countType) {
      query.andWhere('count.countType = :countType', { countType: filters.countType });
    }

    const counts = await query.getMany();
    return counts.map(c => this.toCycleCountResponseDto(c));
  }

  async findCycleCountById(id: number): Promise<CycleCountResponseDto> {
    const count = await this.cycleCountRepository.findOne({ where: { id } });
    if (!count) {
      throw new NotFoundException(`Cycle count with ID ${id} not found`);
    }
    return this.toCycleCountResponseDto(count);
  }

  async startCycleCount(id: number, performedBy: number): Promise<CycleCountResponseDto> {
    const count = await this.cycleCountRepository.findOne({ where: { id } });
    if (!count) {
      throw new NotFoundException(`Cycle count with ID ${id} not found`);
    }

    if (count.status !== CycleCountStatus.PLANNED) {
      throw new BadRequestException('Only planned cycle counts can be started');
    }

    count.status = CycleCountStatus.IN_PROGRESS;
    count.startedAt = new Date();
    count.performedBy = performedBy;

    const updated = await this.cycleCountRepository.save(count);
    return this.toCycleCountResponseDto(updated);
  }

  async updateCycleCount(id: number, dto: UpdateCycleCountDto): Promise<CycleCountResponseDto> {
    const count = await this.cycleCountRepository.findOne({ where: { id } });
    if (!count) {
      throw new NotFoundException(`Cycle count with ID ${id} not found`);
    }

    if (dto.countedQuantity !== undefined) {
      count.countedQuantity = dto.countedQuantity;
      
      if (count.expectedQuantity !== undefined) {
        count.variance = dto.countedQuantity - count.expectedQuantity;
        count.variancePercentage = count.expectedQuantity > 0 
          ? (count.variance / count.expectedQuantity) * 100 
          : 0;
        count.hasVariance = Math.abs(count.variance) > 0.01; // Tolerance for floating point
      }
    }

    if (dto.status) {
      count.status = dto.status;
      if (dto.status === CycleCountStatus.COMPLETED && !count.completedAt) {
        count.completedAt = new Date();
      }
    }

    if (dto.performedBy) {
      count.performedBy = dto.performedBy;
    }

    Object.assign(count, { adjustmentReason: dto.adjustmentReason, remarks: dto.remarks });

    const updated = await this.cycleCountRepository.save(count);
    return this.toCycleCountResponseDto(updated);
  }

  async completeCycleCount(id: number): Promise<CycleCountResponseDto> {
    const count = await this.cycleCountRepository.findOne({ where: { id } });
    if (!count) {
      throw new NotFoundException(`Cycle count with ID ${id} not found`);
    }

    if (count.status !== CycleCountStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress cycle counts can be completed');
    }

    if (count.countedQuantity === undefined) {
      throw new BadRequestException('Counted quantity is required to complete cycle count');
    }

    count.status = CycleCountStatus.COMPLETED;
    count.completedAt = new Date();

    const updated = await this.cycleCountRepository.save(count);
    return this.toCycleCountResponseDto(updated);
  }

  private toCycleCountResponseDto(count: CycleCount): CycleCountResponseDto {
    return {
      id: count.id,
      countNumber: count.countNumber,
      countType: count.countType,
      status: count.status,
      warehouseId: count.warehouseId,
      locationId: count.locationId,
      zone: count.zone,
      materialId: count.materialId,
      batchNumber: count.batchNumber,
      scheduledDate: count.scheduledDate,
      startedAt: count.startedAt,
      completedAt: count.completedAt,
      assignedTo: count.assignedTo,
      performedBy: count.performedBy,
      expectedQuantity: count.expectedQuantity ? Number(count.expectedQuantity) : undefined,
      countedQuantity: count.countedQuantity ? Number(count.countedQuantity) : undefined,
      variance: count.variance ? Number(count.variance) : undefined,
      variancePercentage: count.variancePercentage ? Number(count.variancePercentage) : undefined,
      hasVariance: count.hasVariance,
      remarks: count.remarks,
      adjustmentReason: count.adjustmentReason,
      createdAt: count.createdAt,
      updatedAt: count.updatedAt,
    };
  }

  // ========== Temperature Log Management ==========

  async createTemperatureLog(dto: CreateTemperatureLogDto): Promise<TemperatureLogResponseDto> {
    const log = this.temperatureLogRepository.create({
      ...dto,
      loggedAt: new Date(),
    });

    // Determine status based on thresholds
    let status = TemperatureStatus.NORMAL;
    let isOutOfRange = false;

    if (dto.minThreshold !== undefined || dto.maxThreshold !== undefined) {
      if (dto.minThreshold !== undefined && dto.temperature < dto.minThreshold) {
        status = TemperatureStatus.OUT_OF_RANGE;
        isOutOfRange = true;
      } else if (dto.maxThreshold !== undefined && dto.temperature > dto.maxThreshold) {
        status = TemperatureStatus.OUT_OF_RANGE;
        isOutOfRange = true;
      } else if (
        (dto.minThreshold !== undefined && dto.temperature < dto.minThreshold * 1.05) ||
        (dto.maxThreshold !== undefined && dto.temperature > dto.maxThreshold * 0.95)
      ) {
        status = TemperatureStatus.WARNING;
      }
    }

    log.status = status;
    log.isOutOfRange = isOutOfRange;

    const saved = await this.temperatureLogRepository.save(log);
    return this.toTemperatureLogResponseDto(saved);
  }

  async findAllTemperatureLogs(filters?: { 
    warehouseId?: number; 
    locationId?: string; 
    inventoryItemId?: number; 
    putawayItemId?: number;
    logType?: TemperatureLogType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<TemperatureLogResponseDto[]> {
    const query = this.temperatureLogRepository.createQueryBuilder('log');

    if (filters?.warehouseId) {
      query.andWhere('log.warehouseId = :warehouseId', { warehouseId: filters.warehouseId });
    }
    if (filters?.locationId) {
      query.andWhere('log.locationId = :locationId', { locationId: filters.locationId });
    }
    if (filters?.inventoryItemId) {
      query.andWhere('log.inventoryItemId = :inventoryItemId', { inventoryItemId: filters.inventoryItemId });
    }
    if (filters?.putawayItemId) {
      query.andWhere('log.putawayItemId = :putawayItemId', { putawayItemId: filters.putawayItemId });
    }
    if (filters?.logType) {
      query.andWhere('log.logType = :logType', { logType: filters.logType });
    }
    if (filters?.startDate) {
      query.andWhere('log.loggedAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('log.loggedAt <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('log.loggedAt', 'DESC');

    const logs = await query.getMany();
    return logs.map(l => this.toTemperatureLogResponseDto(l));
  }

  async findTemperatureLogById(id: number): Promise<TemperatureLogResponseDto> {
    const log = await this.temperatureLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Temperature log with ID ${id} not found`);
    }
    return this.toTemperatureLogResponseDto(log);
  }

  private toTemperatureLogResponseDto(log: TemperatureLog): TemperatureLogResponseDto {
    return {
      id: log.id,
      logType: log.logType,
      warehouseId: log.warehouseId,
      locationId: log.locationId,
      inventoryItemId: log.inventoryItemId,
      putawayItemId: log.putawayItemId,
      temperature: Number(log.temperature),
      humidity: log.humidity ? Number(log.humidity) : undefined,
      status: log.status,
      minThreshold: log.minThreshold ? Number(log.minThreshold) : undefined,
      maxThreshold: log.maxThreshold ? Number(log.maxThreshold) : undefined,
      isOutOfRange: log.isOutOfRange,
      sensorId: log.sensorId,
      sensorName: log.sensorName,
      remarks: log.remarks,
      loggedAt: log.loggedAt,
      loggedBy: log.loggedBy,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  // ========== Label & Barcode Management ==========

  async generateBarcode(): Promise<string> {
    const prefix = 'BC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async createLabelBarcode(dto: CreateLabelBarcodeDto): Promise<LabelBarcodeResponseDto> {
    const barcode = await this.generateBarcode();

    const labelBarcode = this.labelBarcodeRepository.create({
      ...dto,
      barcode,
      barcodeType: dto.barcodeType || BarcodeType.CODE128,
      isPrinted: false,
      printCount: 0,
    });

    const saved = await this.labelBarcodeRepository.save(labelBarcode);
    return this.toLabelBarcodeResponseDto(saved);
  }

  async findAllLabelBarcodes(filters?: { 
    labelType?: LabelType; 
    inventoryItemId?: number; 
    putawayItemId?: number;
    materialIssueId?: number;
    cycleCountId?: number;
    locationId?: string;
    batchNumber?: string;
    isPrinted?: boolean;
  }): Promise<LabelBarcodeResponseDto[]> {
    const query = this.labelBarcodeRepository.createQueryBuilder('label');

    if (filters?.labelType) {
      query.andWhere('label.labelType = :labelType', { labelType: filters.labelType });
    }
    if (filters?.inventoryItemId) {
      query.andWhere('label.inventoryItemId = :inventoryItemId', { inventoryItemId: filters.inventoryItemId });
    }
    if (filters?.putawayItemId) {
      query.andWhere('label.putawayItemId = :putawayItemId', { putawayItemId: filters.putawayItemId });
    }
    if (filters?.materialIssueId) {
      query.andWhere('label.materialIssueId = :materialIssueId', { materialIssueId: filters.materialIssueId });
    }
    if (filters?.cycleCountId) {
      query.andWhere('label.cycleCountId = :cycleCountId', { cycleCountId: filters.cycleCountId });
    }
    if (filters?.locationId) {
      query.andWhere('label.locationId = :locationId', { locationId: filters.locationId });
    }
    if (filters?.batchNumber) {
      query.andWhere('label.batchNumber = :batchNumber', { batchNumber: filters.batchNumber });
    }
    if (filters?.isPrinted !== undefined) {
      query.andWhere('label.isPrinted = :isPrinted', { isPrinted: filters.isPrinted });
    }

    const labels = await query.getMany();
    return labels.map(l => this.toLabelBarcodeResponseDto(l));
  }

  async findLabelBarcodeById(id: number): Promise<LabelBarcodeResponseDto> {
    const label = await this.labelBarcodeRepository.findOne({ where: { id } });
    if (!label) {
      throw new NotFoundException(`Label/Barcode with ID ${id} not found`);
    }
    return this.toLabelBarcodeResponseDto(label);
  }

  async findLabelBarcodeByBarcode(barcode: string): Promise<LabelBarcodeResponseDto> {
    const label = await this.labelBarcodeRepository.findOne({ where: { barcode } });
    if (!label) {
      throw new NotFoundException(`Label/Barcode with barcode ${barcode} not found`);
    }
    return this.toLabelBarcodeResponseDto(label);
  }

  async updateLabelBarcode(id: number, dto: UpdateLabelBarcodeDto): Promise<LabelBarcodeResponseDto> {
    const label = await this.labelBarcodeRepository.findOne({ where: { id } });
    if (!label) {
      throw new NotFoundException(`Label/Barcode with ID ${id} not found`);
    }

    Object.assign(label, dto);
    const updated = await this.labelBarcodeRepository.save(label);
    return this.toLabelBarcodeResponseDto(updated);
  }

  async printLabelBarcode(id: number, dto: PrintLabelBarcodeDto): Promise<LabelBarcodeResponseDto> {
    const label = await this.labelBarcodeRepository.findOne({ where: { id } });
    if (!label) {
      throw new NotFoundException(`Label/Barcode with ID ${id} not found`);
    }

    label.isPrinted = true;
    label.printedAt = new Date();
    label.printedBy = dto.printedBy;
    label.printCount = (label.printCount || 0) + (dto.copies || 1);

    const updated = await this.labelBarcodeRepository.save(label);
    return this.toLabelBarcodeResponseDto(updated);
  }

  private toLabelBarcodeResponseDto(label: LabelBarcode): LabelBarcodeResponseDto {
    return {
      id: label.id,
      barcode: label.barcode,
      labelType: label.labelType,
      referenceId: label.referenceId,
      referenceType: label.referenceType,
      inventoryItemId: label.inventoryItemId,
      putawayItemId: label.putawayItemId,
      materialIssueId: label.materialIssueId,
      cycleCountId: label.cycleCountId,
      locationId: label.locationId,
      batchNumber: label.batchNumber,
      barcodeType: label.barcodeType,
      labelData: label.labelData,
      labelTemplate: label.labelTemplate,
      isPrinted: label.isPrinted,
      printedAt: label.printedAt,
      printedBy: label.printedBy,
      printCount: label.printCount,
      remarks: label.remarks,
      createdAt: label.createdAt,
      updatedAt: label.updatedAt,
    };
  }
}


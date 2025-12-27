import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WarehouseService } from './warehouse.service';
import {
  WAREHOUSE_PATTERNS,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateStockMovementDto,
  CreatePutawayItemDto,
  AssignPutawayLocationDto,
  CreateMaterialIssueDto,
  ApproveMaterialIssueDto,
  VerifyInventoryDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateStorageLocationDto,
  UpdateStorageLocationDto,
  CreateCycleCountDto,
  UpdateCycleCountDto,
  CreateTemperatureLogDto,
  CreateLabelBarcodeDto,
  UpdateLabelBarcodeDto,
  PrintLabelBarcodeDto,
} from '@repo/shared';

@Controller()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // Inventory Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_CREATE)
  createInventory(@Payload() createDto: CreateInventoryItemDto) {
    return this.warehouseService.createInventoryItem(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_LIST)
  findAllInventory(@Payload() params?: any) {
    return this.warehouseService.findAllInventory(params);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_GET_BY_ID)
  findInventoryById(@Payload() id: number) {
    return this.warehouseService.findInventoryById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_GET_BY_MATERIAL)
  findInventoryByMaterial(@Payload() materialId: number) {
    return this.warehouseService.findAllInventory({ materialId });
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_GET_BY_BATCH)
  findInventoryByBatch(@Payload() batchNumber: string) {
    return this.warehouseService.findAllInventory({ batchNumber });
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_UPDATE)
  updateInventory(@Payload() data: { id: number; updateDto: UpdateInventoryItemDto }) {
    return this.warehouseService.updateInventoryItem(data.id, data.updateDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_VERIFY)
  verifyInventory(@Payload() verifyDto: VerifyInventoryDto) {
    return this.warehouseService.verifyInventory(verifyDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.INVENTORY_DELETE)
  deleteInventory(@Payload() id: number) {
    return this.warehouseService.deleteInventoryItem(id);
  }

  // Stock Movement Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.MOVEMENT_CREATE)
  createMovement(@Payload() createDto: CreateStockMovementDto) {
    return this.warehouseService.createStockMovement(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MOVEMENT_LIST)
  findAllMovements(@Payload() params?: any) {
    return this.warehouseService.findAllMovements(params);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MOVEMENT_GET_BY_ID)
  findMovementById(@Payload() id: number) {
    return this.warehouseService.findMovementById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MOVEMENT_GET_BY_REFERENCE)
  findMovementsByReference(@Payload() referenceId: string) {
    return this.warehouseService.findAllMovements({ referenceId });
  }

  // Putaway Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.PUTAWAY_CREATE)
  createPutaway(@Payload() createDto: CreatePutawayItemDto) {
    return this.warehouseService.createPutawayItem(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.PUTAWAY_LIST)
  findAllPutaway(@Payload() params?: any) {
    return this.warehouseService.findAllPutawayItems(params);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.PUTAWAY_GET_BY_ID)
  findPutawayById(@Payload() id: number) {
    return this.warehouseService.findPutawayById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.PUTAWAY_GET_BY_QA_RELEASE)
  findPutawayByQARelease(@Payload() qaReleaseId: number) {
    return this.warehouseService.findAllPutawayItems({ qaReleaseId });
  }

  @MessagePattern(WAREHOUSE_PATTERNS.PUTAWAY_ASSIGN_LOCATION)
  assignPutawayLocation(@Payload() data: { id: number; assignDto: AssignPutawayLocationDto }) {
    return this.warehouseService.assignPutawayLocation(data.id, data.assignDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.PUTAWAY_COMPLETE)
  completePutaway(@Payload() data: { id: number; completedBy: number }) {
    return this.warehouseService.completePutaway(data.id, data.completedBy);
  }

  // Material Issue Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_CREATE)
  createMaterialIssue(@Payload() createDto: CreateMaterialIssueDto) {
    return this.warehouseService.createMaterialIssue(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_LIST)
  findAllMaterialIssues(@Payload() params?: any) {
    return this.warehouseService.findAllMaterialIssues(params);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_GET_BY_ID)
  findMaterialIssueById(@Payload() id: number) {
    return this.warehouseService.findMaterialIssueById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_APPROVE)
  approveMaterialIssue(@Payload() data: { id: number; approveDto: ApproveMaterialIssueDto }) {
    return this.warehouseService.approveMaterialIssue(data.id, data.approveDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_PICK)
  pickMaterialIssue(@Payload() data: { id: number; pickedBy: number }) {
    return this.warehouseService.pickMaterialIssue(data.id, data.pickedBy);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_ISSUE)
  issueMaterial(@Payload() data: { id: number; issuedBy: number }) {
    return this.warehouseService.issueMaterial(data.id, data.issuedBy);
  }

  // Warehouse Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.WAREHOUSE_CREATE)
  createWarehouse(@Payload() createDto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.WAREHOUSE_LIST)
  findAllWarehouses(@Payload() filters?: any) {
    return this.warehouseService.findAllWarehouses(filters);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.WAREHOUSE_GET_BY_ID)
  findWarehouseById(@Payload() id: number) {
    return this.warehouseService.findWarehouseById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.WAREHOUSE_UPDATE)
  updateWarehouse(@Payload() data: { id: number; updateDto: UpdateWarehouseDto }) {
    return this.warehouseService.updateWarehouse(data.id, data.updateDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.WAREHOUSE_DELETE)
  deleteWarehouse(@Payload() id: number) {
    return this.warehouseService.deleteWarehouse(id);
  }

  // Storage Location Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.LOCATION_CREATE)
  createStorageLocation(@Payload() createDto: CreateStorageLocationDto) {
    return this.warehouseService.createStorageLocation(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LOCATION_LIST)
  findAllStorageLocations(@Payload() filters?: any) {
    return this.warehouseService.findAllStorageLocations(filters);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LOCATION_GET_BY_ID)
  findStorageLocationById(@Payload() id: number) {
    return this.warehouseService.findStorageLocationById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LOCATION_GET_BY_WAREHOUSE)
  findStorageLocationsByWarehouse(@Payload() warehouseId: number) {
    return this.warehouseService.findAllStorageLocations({ warehouseId });
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LOCATION_UPDATE)
  updateStorageLocation(@Payload() data: { id: number; updateDto: UpdateStorageLocationDto }) {
    return this.warehouseService.updateStorageLocation(data.id, data.updateDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LOCATION_DELETE)
  deleteStorageLocation(@Payload() id: number) {
    return this.warehouseService.deleteStorageLocation(id);
  }

  // Cycle Count Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.CYCLE_COUNT_CREATE)
  createCycleCount(@Payload() createDto: CreateCycleCountDto) {
    return this.warehouseService.createCycleCount(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.CYCLE_COUNT_LIST)
  findAllCycleCounts(@Payload() filters?: any) {
    return this.warehouseService.findAllCycleCounts(filters);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.CYCLE_COUNT_GET_BY_ID)
  findCycleCountById(@Payload() id: number) {
    return this.warehouseService.findCycleCountById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.CYCLE_COUNT_START)
  startCycleCount(@Payload() data: { id: number; performedBy: number }) {
    return this.warehouseService.startCycleCount(data.id, data.performedBy);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.CYCLE_COUNT_UPDATE)
  updateCycleCount(@Payload() data: { id: number; updateDto: UpdateCycleCountDto }) {
    return this.warehouseService.updateCycleCount(data.id, data.updateDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.CYCLE_COUNT_COMPLETE)
  completeCycleCount(@Payload() id: number) {
    return this.warehouseService.completeCycleCount(id);
  }

  // Temperature Log Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.TEMPERATURE_LOG_CREATE)
  createTemperatureLog(@Payload() createDto: CreateTemperatureLogDto) {
    return this.warehouseService.createTemperatureLog(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.TEMPERATURE_LOG_LIST)
  findAllTemperatureLogs(@Payload() filters?: any) {
    return this.warehouseService.findAllTemperatureLogs(filters);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.TEMPERATURE_LOG_GET_BY_ID)
  findTemperatureLogById(@Payload() id: number) {
    return this.warehouseService.findTemperatureLogById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.TEMPERATURE_LOG_GET_BY_REFERENCE)
  findTemperatureLogsByReference(@Payload() data: { logType: string; referenceId: number }) {
    const filters: any = {};
    if (data.logType === 'Inventory Item') {
      filters.inventoryItemId = data.referenceId;
    } else if (data.logType === 'Putaway') {
      filters.putawayItemId = data.referenceId;
    } else if (data.logType === 'Warehouse') {
      filters.warehouseId = data.referenceId;
    } else if (data.logType === 'Location') {
      filters.locationId = data.referenceId.toString();
    }
    return this.warehouseService.findAllTemperatureLogs(filters);
  }

  // Label & Barcode Patterns
  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_CREATE)
  createLabelBarcode(@Payload() createDto: CreateLabelBarcodeDto) {
    return this.warehouseService.createLabelBarcode(createDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_LIST)
  findAllLabelBarcodes(@Payload() filters?: any) {
    return this.warehouseService.findAllLabelBarcodes(filters);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_GET_BY_ID)
  findLabelBarcodeById(@Payload() id: number) {
    return this.warehouseService.findLabelBarcodeById(id);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_GET_BY_BARCODE)
  findLabelBarcodeByBarcode(@Payload() barcode: string) {
    return this.warehouseService.findLabelBarcodeByBarcode(barcode);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_GET_BY_REFERENCE)
  findLabelBarcodesByReference(@Payload() data: { labelType: string; referenceId: number }) {
    const filters: any = { labelType: data.labelType };
    if (data.labelType === 'Inventory Item') {
      filters.inventoryItemId = data.referenceId;
    } else if (data.labelType === 'Putaway') {
      filters.putawayItemId = data.referenceId;
    } else if (data.labelType === 'Material Issue') {
      filters.materialIssueId = data.referenceId;
    } else if (data.labelType === 'Cycle Count') {
      filters.cycleCountId = data.referenceId;
    }
    return this.warehouseService.findAllLabelBarcodes(filters);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_UPDATE)
  updateLabelBarcode(@Payload() data: { id: number; updateDto: UpdateLabelBarcodeDto }) {
    return this.warehouseService.updateLabelBarcode(data.id, data.updateDto);
  }

  @MessagePattern(WAREHOUSE_PATTERNS.LABEL_BARCODE_PRINT)
  printLabelBarcode(@Payload() data: { id: number; printDto: PrintLabelBarcodeDto }) {
    return this.warehouseService.printLabelBarcode(data.id, data.printDto);
  }
}


import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
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
} from '@repo/shared';

@Controller('warehouse')
export class WarehouseController {
  constructor(
    @Inject('WAREHOUSE_SERVICE')
    private warehouseClient: ClientProxy,
  ) {}

  // ========== Inventory Endpoints ==========

  @Post('inventory')
  @HttpCode(HttpStatus.CREATED)
  async createInventory(@Body() createDto: CreateInventoryItemDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_CREATE, createDto)
    );
  }

  @Get('inventory')
  async findAllInventory(
    @Query('materialId') materialId?: string,
    @Query('batchNumber') batchNumber?: string,
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
  ) {
    const params: any = {};
    if (materialId) params.materialId = parseInt(materialId, 10);
    if (batchNumber) params.batchNumber = batchNumber;
    if (status) params.status = status;
    if (locationId) params.locationId = locationId;

    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_LIST, params)
    );
  }

  @Get('inventory/:id')
  async findInventoryById(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put('inventory/:id')
  async updateInventory(@Param('id') id: string, @Body() updateDto: UpdateInventoryItemDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Post('inventory/:id/verify')
  async verifyInventory(@Param('id') id: string, @Body() verifyDto: VerifyInventoryDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_VERIFY, {
        ...verifyDto,
        inventoryItemId: parseInt(id, 10),
      })
    );
  }

  @Delete('inventory/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInventory(@Param('id') id: string) {
    await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.INVENTORY_DELETE, parseInt(id, 10))
    );
  }

  // ========== Stock Movements Endpoints ==========

  @Post('movements')
  @HttpCode(HttpStatus.CREATED)
  async createMovement(@Body() createDto: CreateStockMovementDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MOVEMENT_CREATE, createDto)
    );
  }

  @Get('movements')
  async findAllMovements(
    @Query('materialId') materialId?: string,
    @Query('batchNumber') batchNumber?: string,
    @Query('movementType') movementType?: string,
    @Query('referenceId') referenceId?: string,
  ) {
    const params: any = {};
    if (materialId) params.materialId = parseInt(materialId, 10);
    if (batchNumber) params.batchNumber = batchNumber;
    if (movementType) params.movementType = movementType;
    if (referenceId) params.referenceId = referenceId;

    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MOVEMENT_LIST, params)
    );
  }

  @Get('movements/:id')
  async findMovementById(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MOVEMENT_GET_BY_ID, parseInt(id, 10))
    );
  }

  // ========== Putaway Endpoints ==========

  @Post('putaway')
  @HttpCode(HttpStatus.CREATED)
  async createPutaway(@Body() createDto: CreatePutawayItemDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.PUTAWAY_CREATE, createDto)
    );
  }

  @Get('putaway')
  async findAllPutaway(
    @Query('status') status?: string,
    @Query('qaReleaseId') qaReleaseId?: string,
  ) {
    const params: any = {};
    if (status) params.status = status;
    if (qaReleaseId) params.qaReleaseId = parseInt(qaReleaseId, 10);

    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.PUTAWAY_LIST, params)
    );
  }

  @Get('putaway/:id')
  async findPutawayById(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.PUTAWAY_GET_BY_ID, parseInt(id, 10))
    );
  }

  @Post('putaway/:id/assign-location')
  async assignPutawayLocation(@Param('id') id: string, @Body() assignDto: AssignPutawayLocationDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.PUTAWAY_ASSIGN_LOCATION, {
        id: parseInt(id, 10),
        assignDto,
      })
    );
  }

  @Post('putaway/:id/complete')
  async completePutaway(@Param('id') id: string, @Body() body: { completedBy: number }) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.PUTAWAY_COMPLETE, {
        id: parseInt(id, 10),
        completedBy: body.completedBy,
      })
    );
  }

  // ========== Material Issue Endpoints ==========

  @Post('material-issues')
  @HttpCode(HttpStatus.CREATED)
  async createMaterialIssue(@Body() createDto: CreateMaterialIssueDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_CREATE, createDto)
    );
  }

  @Get('material-issues')
  async findAllMaterialIssues(
    @Query('status') status?: string,
    @Query('workOrderId') workOrderId?: string,
    @Query('batchId') batchId?: string,
  ) {
    const params: any = {};
    if (status) params.status = status;
    if (workOrderId) params.workOrderId = workOrderId;
    if (batchId) params.batchId = batchId;

    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_LIST, params)
    );
  }

  @Get('material-issues/:id')
  async findMaterialIssueById(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_GET_BY_ID, parseInt(id, 10))
    );
  }

  @Post('material-issues/:id/approve')
  async approveMaterialIssue(@Param('id') id: string, @Body() approveDto: ApproveMaterialIssueDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_APPROVE, {
        id: parseInt(id, 10),
        approveDto,
      })
    );
  }

  @Post('material-issues/:id/pick')
  async pickMaterialIssue(@Param('id') id: string, @Body() body: { pickedBy: number }) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_PICK, {
        id: parseInt(id, 10),
        pickedBy: body.pickedBy,
      })
    );
  }

  @Post('material-issues/:id/issue')
  async issueMaterial(@Param('id') id: string, @Body() body: { issuedBy: number }) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.MATERIAL_ISSUE_ISSUE, {
        id: parseInt(id, 10),
        issuedBy: body.issuedBy,
      })
    );
  }

  // ========== Warehouse Endpoints ==========

  @Post('warehouses')
  @HttpCode(HttpStatus.CREATED)
  async createWarehouse(@Body() createDto: CreateWarehouseDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.WAREHOUSE_CREATE, createDto)
    );
  }

  @Get('warehouses')
  async findAllWarehouses(
    @Query('siteId') siteId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const filters: any = {};
    if (siteId) filters.siteId = parseInt(siteId, 10);
    if (status) filters.status = status;
    if (type) filters.type = type;

    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.WAREHOUSE_LIST, filters)
    );
  }

  @Get('warehouses/:id')
  async findWarehouseById(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.WAREHOUSE_GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put('warehouses/:id')
  async updateWarehouse(@Param('id') id: string, @Body() updateDto: UpdateWarehouseDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.WAREHOUSE_UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Delete('warehouses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWarehouse(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.WAREHOUSE_DELETE, parseInt(id, 10))
    );
  }

  // ========== Storage Location Endpoints ==========

  @Post('storage-locations')
  @HttpCode(HttpStatus.CREATED)
  async createStorageLocation(@Body() createDto: CreateStorageLocationDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.LOCATION_CREATE, createDto)
    );
  }

  @Get('storage-locations')
  async findAllStorageLocations(
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const filters: any = {};
    if (warehouseId) filters.warehouseId = parseInt(warehouseId, 10);
    if (status) filters.status = status;
    if (type) filters.type = type;

    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.LOCATION_LIST, filters)
    );
  }

  @Get('storage-locations/:id')
  async findStorageLocationById(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.LOCATION_GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put('storage-locations/:id')
  async updateStorageLocation(@Param('id') id: string, @Body() updateDto: UpdateStorageLocationDto) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.LOCATION_UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Delete('storage-locations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStorageLocation(@Param('id') id: string) {
    return await firstValueFrom(
      this.warehouseClient.send(WAREHOUSE_PATTERNS.LOCATION_DELETE, parseInt(id, 10))
    );
  }
}


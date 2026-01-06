import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MaterialConsumption } from '../entities/material-consumption.entity';
import { Batch } from '../entities/batch.entity';
import {
  ConsumeMaterialDto,
  UpdateMaterialConsumptionDto,
  MaterialConsumptionResponseDto,
  MaterialConsumptionStatus,
  WAREHOUSE_PATTERNS,
  CreateStockMovementDto,
  StockMovementType,
} from '@repo/shared';

@Injectable()
export class MaterialConsumptionService {
  constructor(
    @InjectRepository(MaterialConsumption)
    private materialConsumptionRepository: Repository<MaterialConsumption>,
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
    @Inject('WAREHOUSE_SERVICE')
    private warehouseClient: ClientProxy,
  ) {}

  async consume(batchId: number, consumeDto: ConsumeMaterialDto): Promise<MaterialConsumptionResponseDto> {
    // Verify batch exists
    const batch = await this.batchesRepository.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    if (batch.status !== 'In Progress') {
      throw new BadRequestException(`Cannot consume material. Batch status must be 'In Progress'. Current: ${batch.status}`);
    }

    // TODO: Check material availability in warehouse
    // For now, we'll create the consumption record and stock movement

    // Create stock movement via warehouse service
    const stockMovementDto: CreateStockMovementDto = {
      movementType: StockMovementType.CONSUMPTION,
      materialId: consumeDto.materialId,
      materialName: consumeDto.materialName,
      materialCode: consumeDto.materialCode,
      batchNumber: consumeDto.batchNumber,
      quantity: consumeDto.actualQuantity,
      unit: consumeDto.unit,
      fromLocationId: consumeDto.locationId?.toString(),
      referenceId: batchId.toString(),
      referenceType: 'Batch',
      remarks: `Material consumption for batch ${batch.batchNumber}`,
      performedBy: consumeDto.consumedBy,
    };

    try {
      await firstValueFrom(
        this.warehouseClient.send(WAREHOUSE_PATTERNS.MOVEMENT_CREATE, stockMovementDto)
      );
    } catch (error) {
      throw new BadRequestException(`Failed to create stock movement: ${error.message}`);
    }

    // Create consumption record
    const consumption = this.materialConsumptionRepository.create({
      batchId,
      materialId: consumeDto.materialId,
      materialName: consumeDto.materialName,
      materialCode: consumeDto.materialCode,
      batchNumber: consumeDto.batchNumber,
      plannedQuantity: consumeDto.plannedQuantity,
      actualQuantity: consumeDto.actualQuantity,
      unit: consumeDto.unit,
      status: consumeDto.status || MaterialConsumptionStatus.CONSUMED,
      locationId: consumeDto.locationId,
      consumedAt: new Date(),
      consumedBy: consumeDto.consumedBy,
      remarks: consumeDto.remarks,
    });

    const saved = await this.materialConsumptionRepository.save(consumption);
    return this.toResponseDto(saved);
  }

  async findAll(batchId: number): Promise<MaterialConsumptionResponseDto[]> {
    const consumptions = await this.materialConsumptionRepository.find({
      where: { batchId },
      order: { consumedAt: 'DESC' },
    });
    return consumptions.map(consumption => this.toResponseDto(consumption));
  }

  async findOne(id: number): Promise<MaterialConsumptionResponseDto> {
    const consumption = await this.materialConsumptionRepository.findOne({ where: { id } });
    if (!consumption) {
      throw new NotFoundException(`Material consumption with ID ${id} not found`);
    }
    return this.toResponseDto(consumption);
  }

  async findAll(params?: {
    batchId?: number;
    materialId?: number;
    status?: MaterialConsumptionStatus;
    page?: number;
    limit?: number;
  }): Promise<{ consumptions: MaterialConsumptionResponseDto[]; pagination: { page: number; pages: number; total: number } }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.batchId) where.batchId = params.batchId;
    if (params?.materialId) where.materialId = params.materialId;
    if (params?.status) where.status = params.status;

    const [consumptions, total] = await this.materialConsumptionRepository.findAndCount({
      where,
      order: { consumedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      consumptions: consumptions.map(consumption => this.toResponseDto(consumption)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async update(id: number, updateDto: UpdateMaterialConsumptionDto): Promise<MaterialConsumptionResponseDto> {
    const consumption = await this.materialConsumptionRepository.findOne({ where: { id } });
    if (!consumption) {
      throw new NotFoundException(`Material consumption with ID ${id} not found`);
    }

    Object.assign(consumption, updateDto);
    const updated = await this.materialConsumptionRepository.save(consumption);
    return this.toResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    const consumption = await this.materialConsumptionRepository.findOne({ where: { id } });
    if (!consumption) {
      throw new NotFoundException(`Material consumption with ID ${id} not found`);
    }
    await this.materialConsumptionRepository.remove(consumption);
  }

  private toResponseDto(consumption: MaterialConsumption): MaterialConsumptionResponseDto {
    return {
      id: consumption.id,
      batchId: consumption.batchId,
      materialId: consumption.materialId,
      materialName: consumption.materialName,
      materialCode: consumption.materialCode,
      batchNumber: consumption.batchNumber,
      plannedQuantity: Number(consumption.plannedQuantity),
      actualQuantity: Number(consumption.actualQuantity),
      unit: consumption.unit,
      status: consumption.status,
      locationId: consumption.locationId,
      consumedAt: consumption.consumedAt,
      consumedBy: consumption.consumedBy,
      consumedByName: undefined, // Would be populated from user service
      remarks: consumption.remarks,
      createdAt: consumption.createdAt,
      updatedAt: consumption.updatedAt,
    };
  }
}


import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';
import {
  CreateBOMDto,
  UpdateBOMDto,
  BOMResponseDto,
  BOMItemDto,
  BOMStatus,
} from '@repo/shared';

@Injectable()
export class BOMsService {
  constructor(
    @InjectRepository(BOM)
    private bomsRepository: Repository<BOM>,
    @InjectRepository(BOMItem)
    private bomItemsRepository: Repository<BOMItem>,
  ) {}

  async generateBOMNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BOM-${year}-`;
    
    const lastBOM = await this.bomsRepository
      .createQueryBuilder('bom')
      .where('bom.bomNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('bom.bomNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastBOM) {
      const lastSequence = parseInt(lastBOM.bomNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async getNextVersion(drugId: number): Promise<number> {
    const lastBOM = await this.bomsRepository.findOne({
      where: { drugId },
      order: { version: 'DESC' },
    });

    return lastBOM ? lastBOM.version + 1 : 1;
  }

  async create(createDto: CreateBOMDto): Promise<BOMResponseDto> {
    const bomNumber = await this.generateBOMNumber();
    const version = await this.getNextVersion(createDto.drugId);

    // Create BOM
    const bom = this.bomsRepository.create({
      bomNumber,
      drugId: createDto.drugId,
      drugName: createDto.drugName,
      drugCode: createDto.drugCode,
      version,
      status: createDto.status || BOMStatus.DRAFT,
      batchSize: createDto.batchSize,
      yield: createDto.yield,
      effectiveDate: createDto.effectiveDate ? new Date(createDto.effectiveDate) : undefined,
      expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
      createdBy: createDto.createdBy,
      remarks: createDto.remarks,
    });

    const savedBOM = await this.bomsRepository.save(bom);

    // Create BOM items
    if (createDto.items && createDto.items.length > 0) {
      const bomItems = createDto.items.map((item, index) =>
        this.bomItemsRepository.create({
          bomId: savedBOM.id,
          materialId: item.materialId,
          materialName: item.materialName,
          materialCode: item.materialCode,
          quantityPerBatch: item.quantityPerBatch,
          unit: item.unit,
          tolerance: item.tolerance,
          isCritical: item.isCritical || false,
          sequence: item.sequence || index + 1,
          remarks: item.remarks,
        })
      );
      await this.bomItemsRepository.save(bomItems);
    }

    return this.findOne(savedBOM.id);
  }

  async findAll(params?: {
    search?: string;
    drugId?: number;
    status?: BOMStatus;
    version?: number;
    page?: number;
    limit?: number;
  }): Promise<{ boms: BOMResponseDto[]; pagination: { page: number; pages: number; total: number } }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<BOM> = {};
    
    if (params?.drugId) {
      where.drugId = params.drugId;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.version) {
      where.version = params.version;
    }
    if (params?.search) {
      where.bomNumber = Like(`%${params.search}%`);
    }

    const [boms, total] = await this.bomsRepository.findAndCount({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      boms: boms.map(bom => this.toResponseDto(bom)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async findOne(id: number): Promise<BOMResponseDto> {
    const bom = await this.bomsRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }
    return this.toResponseDto(bom);
  }

  async findByDrug(drugId: number, status?: BOMStatus): Promise<BOMResponseDto[]> {
    const where: FindOptionsWhere<BOM> = { drugId };
    if (status) {
      where.status = status;
    }

    const boms = await this.bomsRepository.find({
      where,
      relations: ['items'],
      order: { version: 'DESC' },
    });

    return boms.map(bom => this.toResponseDto(bom));
  }

  async update(id: number, updateDto: UpdateBOMDto): Promise<BOMResponseDto> {
    const bom = await this.bomsRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status === BOMStatus.APPROVED || bom.status === BOMStatus.ACTIVE) {
      throw new BadRequestException(`Cannot update BOM. Current status: ${bom.status}`);
    }

    // Update BOM fields
    Object.assign(bom, {
      ...updateDto,
      effectiveDate: updateDto.effectiveDate ? new Date(updateDto.effectiveDate) : bom.effectiveDate,
      expiryDate: updateDto.expiryDate ? new Date(updateDto.expiryDate) : bom.expiryDate,
    });

    // Update items if provided
    if (updateDto.items) {
      // Delete existing items
      await this.bomItemsRepository.delete({ bomId: id });

      // Create new items
      const bomItems = updateDto.items.map((item, index) =>
        this.bomItemsRepository.create({
          bomId: id,
          materialId: item.materialId,
          materialName: item.materialName,
          materialCode: item.materialCode,
          quantityPerBatch: item.quantityPerBatch,
          unit: item.unit,
          tolerance: item.tolerance,
          isCritical: item.isCritical || false,
          sequence: item.sequence || index + 1,
          remarks: item.remarks,
        })
      );
      await this.bomItemsRepository.save(bomItems);
    }

    const updated = await this.bomsRepository.save(bom);
    return this.findOne(updated.id);
  }

  async approve(id: number, approvedBy: number): Promise<BOMResponseDto> {
    const bom = await this.bomsRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status !== BOMStatus.DRAFT && bom.status !== BOMStatus.UNDER_REVIEW) {
      throw new BadRequestException(`Cannot approve BOM. Current status: ${bom.status}`);
    }

    // Set previous active BOM to obsolete
    if (bom.status === BOMStatus.UNDER_REVIEW) {
      await this.bomsRepository.update(
        { drugId: bom.drugId, status: BOMStatus.ACTIVE },
        { status: BOMStatus.OBSOLETE }
      );
    }

    bom.status = BOMStatus.APPROVED;
    bom.approvedBy = approvedBy;
    bom.approvedAt = new Date();

    const updated = await this.bomsRepository.save(bom);
    return this.toResponseDto(updated);
  }

  async activate(id: number): Promise<BOMResponseDto> {
    const bom = await this.bomsRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status !== BOMStatus.APPROVED) {
      throw new BadRequestException(`Cannot activate BOM. Current status: ${bom.status}`);
    }

    // Set previous active BOM to obsolete
    await this.bomsRepository.update(
      { drugId: bom.drugId, status: BOMStatus.ACTIVE },
      { status: BOMStatus.OBSOLETE }
    );

    bom.status = BOMStatus.ACTIVE;
    const updated = await this.bomsRepository.save(bom);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const bom = await this.bomsRepository.findOne({ where: { id } });
    if (!bom) {
      throw new NotFoundException(`BOM with ID ${id} not found`);
    }

    if (bom.status === BOMStatus.ACTIVE) {
      throw new BadRequestException(`Cannot delete active BOM`);
    }

    await this.bomsRepository.remove(bom);
  }

  private toResponseDto(bom: BOM): BOMResponseDto {
    return {
      id: bom.id,
      bomNumber: bom.bomNumber,
      drugId: bom.drugId,
      drugName: bom.drugName,
      drugCode: bom.drugCode,
      version: bom.version,
      status: bom.status,
      batchSize: Number(bom.batchSize),
      yield: bom.yield ? Number(bom.yield) : undefined,
      effectiveDate: bom.effectiveDate,
      expiryDate: bom.expiryDate,
      createdBy: bom.createdBy,
      createdByName: undefined, // Would be populated from user service
      approvedBy: bom.approvedBy,
      approvedByName: undefined, // Would be populated from user service
      approvedAt: bom.approvedAt,
      remarks: bom.remarks,
      items: (bom.items || []).map(item => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.materialName,
        materialCode: item.materialCode,
        quantityPerBatch: Number(item.quantityPerBatch),
        unit: item.unit,
        tolerance: item.tolerance ? Number(item.tolerance) : undefined,
        isCritical: item.isCritical,
        sequence: item.sequence,
        remarks: item.remarks,
      })),
      createdAt: bom.createdAt,
      updatedAt: bom.updatedAt,
    };
  }
}


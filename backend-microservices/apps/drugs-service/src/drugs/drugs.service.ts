import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drug } from '../entities/drug.entity';
import {
  CreateDrugDto,
  UpdateDrugDto,
  DrugResponseDto,
} from '@repo/shared';

@Injectable()
export class DrugsService {
  constructor(
    @InjectRepository(Drug)
    private drugsRepository: Repository<Drug>,
  ) {}

  async create(createDto: CreateDrugDto): Promise<DrugResponseDto> {
    // Check if code already exists
    const existingDrug = await this.drugsRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingDrug) {
      throw new BadRequestException(`Drug with code ${createDto.code} already exists`);
    }

    const drug = this.drugsRepository.create({
      ...createDto,
      expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
    });

    const saved = await this.drugsRepository.save(drug);
    return this.toResponseDto(saved);
  }

  async findAll(params?: {
    search?: string;
    dosageForm?: string;
    route?: string;
    approvalStatus?: string;
    therapeuticClass?: string;
    manufacturer?: string;
    page?: number;
    limit?: number;
  }): Promise<{ drugs: DrugResponseDto[]; pagination: any }> {
    const queryBuilder = this.drugsRepository.createQueryBuilder('drug');

    if (params?.search) {
      queryBuilder.where(
        '(drug.name ILIKE :search OR drug.code ILIKE :search OR drug.formula ILIKE :search OR drug.description ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    if (params?.dosageForm) {
      queryBuilder.andWhere('drug.dosageForm = :dosageForm', { dosageForm: params.dosageForm });
    }

    if (params?.route) {
      queryBuilder.andWhere('drug.route = :route', { route: params.route });
    }

    if (params?.approvalStatus) {
      queryBuilder.andWhere('drug.approvalStatus = :approvalStatus', { approvalStatus: params.approvalStatus });
    }

    if (params?.therapeuticClass) {
      queryBuilder.andWhere('drug.therapeuticClass ILIKE :therapeuticClass', { therapeuticClass: `%${params.therapeuticClass}%` });
    }

    if (params?.manufacturer) {
      queryBuilder.andWhere('drug.manufacturer ILIKE :manufacturer', { manufacturer: `%${params.manufacturer}%` });
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit).orderBy('drug.createdAt', 'DESC');

    const [drugs, total] = await queryBuilder.getManyAndCount();

    return {
      drugs: drugs.map(drug => this.toResponseDto(drug)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<DrugResponseDto> {
    const drug = await this.drugsRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Drug with ID ${id} not found`);
    }
    return this.toResponseDto(drug);
  }

  async update(id: number, updateDto: UpdateDrugDto): Promise<DrugResponseDto> {
    const drug = await this.drugsRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Drug with ID ${id} not found`);
    }

    // Check if code is being updated and if it conflicts
    if (updateDto.code && updateDto.code !== drug.code) {
      const existingDrug = await this.drugsRepository.findOne({
        where: { code: updateDto.code },
      });
      if (existingDrug) {
        throw new BadRequestException(`Drug with code ${updateDto.code} already exists`);
      }
    }

    Object.assign(drug, {
      ...updateDto,
      expiryDate: updateDto.expiryDate ? new Date(updateDto.expiryDate) : drug.expiryDate,
    });

    const updated = await this.drugsRepository.save(drug);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const drug = await this.drugsRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException(`Drug with ID ${id} not found`);
    }
    await this.drugsRepository.remove(drug);
  }

  private toResponseDto(drug: Drug): DrugResponseDto {
    return {
      id: drug.id,
      code: drug.code,
      name: drug.name,
      formula: drug.formula,
      strength: drug.strength,
      dosageForm: drug.dosageForm,
      route: drug.route,
      description: drug.description,
      approvalStatus: drug.approvalStatus,
      therapeuticClass: drug.therapeuticClass,
      manufacturer: drug.manufacturer,
      registrationNumber: drug.registrationNumber,
      expiryDate: drug.expiryDate,
      storageConditions: drug.storageConditions,
      createdBy: drug.createdBy,
      createdAt: drug.createdAt,
      updatedAt: drug.updatedAt,
    };
  }
}


import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drug } from '../entities/drug.entity';
import { CreateDrugDto, UpdateDrugDto, DrugResponseDto } from '@repo/shared';

@Injectable()
export class DrugsService {
  constructor(@InjectRepository(Drug) private drugsRepository: Repository<Drug>) {}

  async create(createDto: CreateDrugDto): Promise<DrugResponseDto> {
    const existing = await this.drugsRepository.findOne({ where: { code: createDto.code } });
    if (existing) throw new BadRequestException('Drug with this code already exists');
    const drug = this.drugsRepository.create({
      ...createDto,
      expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
    });
    const saved = await this.drugsRepository.save(drug);
    return this.toResponseDto(saved);
  }

  async findAll(params?: any): Promise<{ drugs: DrugResponseDto[]; pagination: any }> {
    const qb = this.drugsRepository.createQueryBuilder('drug');
    if (params?.search) qb.where('(drug.name ILIKE :search OR drug.code ILIKE :search)', { search: `%${params.search}%` });
    if (params?.dosageForm) qb.andWhere('drug.dosageForm = :dosageForm', { dosageForm: params.dosageForm });
    if (params?.route) qb.andWhere('drug.route = :route', { route: params.route });
    if (params?.approvalStatus) qb.andWhere('drug.approvalStatus = :approvalStatus', { approvalStatus: params.approvalStatus });
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    qb.skip((page - 1) * limit).take(limit).orderBy('drug.createdAt', 'DESC');
    const [drugs, total] = await qb.getManyAndCount();
    return { drugs: drugs.map((d) => this.toResponseDto(d)), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number): Promise<DrugResponseDto> {
    const drug = await this.drugsRepository.findOne({ where: { id } });
    if (!drug) throw new NotFoundException('Drug not found');
    return this.toResponseDto(drug);
  }

  async update(id: number, updateDto: UpdateDrugDto): Promise<DrugResponseDto> {
    const drug = await this.drugsRepository.findOne({ where: { id } });
    if (!drug) throw new NotFoundException('Drug not found');
    if (updateDto.code && updateDto.code !== drug.code) {
      const ex = await this.drugsRepository.findOne({ where: { code: updateDto.code } });
      if (ex) throw new BadRequestException('Drug with this code already exists');
    }
    Object.assign(drug, { ...updateDto, expiryDate: updateDto.expiryDate ? new Date(updateDto.expiryDate) : drug.expiryDate });
    const updated = await this.drugsRepository.save(drug);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const drug = await this.drugsRepository.findOne({ where: { id } });
    if (!drug) throw new NotFoundException('Drug not found');
    await this.drugsRepository.remove(drug);
  }

  private toResponseDto(drug: Drug): DrugResponseDto {
    return {
      id: drug.id,
      code: drug.code,
      name: drug.name,
      formula: drug.formula ?? undefined,
      strength: drug.strength ?? undefined,
      dosageForm: drug.dosageForm,
      route: drug.route,
      description: drug.description ?? undefined,
      approvalStatus: drug.approvalStatus,
      therapeuticClass: drug.therapeuticClass ?? undefined,
      manufacturer: drug.manufacturer ?? undefined,
      registrationNumber: drug.registrationNumber ?? undefined,
      expiryDate: drug.expiryDate ?? undefined,
      storageConditions: drug.storageConditions ?? undefined,
      createdBy: drug.createdBy,
      createdAt: drug.createdAt,
      updatedAt: drug.updatedAt,
    };
  }
}

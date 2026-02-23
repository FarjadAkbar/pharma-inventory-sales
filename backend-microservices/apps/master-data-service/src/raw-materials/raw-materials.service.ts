import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawMaterial } from '../entities/raw-material.entity';
import { Supplier } from '../entities/supplier.entity';
import { CreateRawMaterialDto, UpdateRawMaterialDto, RawMaterialResponseDto } from '@repo/shared';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectRepository(RawMaterial) private rawMaterialsRepository: Repository<RawMaterial>,
    @InjectRepository(Supplier) private suppliersRepository: Repository<Supplier>,
  ) {}

  async create(createDto: CreateRawMaterialDto): Promise<RawMaterialResponseDto> {
    const existing = await this.rawMaterialsRepository.findOne({ where: { code: createDto.code } });
    if (existing) throw new BadRequestException('Raw material with this code already exists');
    const rawMaterial = this.rawMaterialsRepository.create(createDto);
    const saved = await this.rawMaterialsRepository.save(rawMaterial);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<RawMaterialResponseDto[]> {
    const list = await this.rawMaterialsRepository.find({ order: { createdAt: 'DESC' } });
    return Promise.all(list.map((rm) => this.toResponseDto(rm)));
  }

  async findOne(id: number): Promise<RawMaterialResponseDto> {
    const rm = await this.rawMaterialsRepository.findOne({ where: { id } });
    if (!rm) throw new NotFoundException('Raw material not found');
    return this.toResponseDto(rm);
  }

  async findBySupplierId(supplierId: number): Promise<RawMaterialResponseDto[]> {
    const list = await this.rawMaterialsRepository.find({ where: { supplierId }, order: { createdAt: 'DESC' } });
    return Promise.all(list.map((rm) => this.toResponseDto(rm)));
  }

  async update(id: number, updateDto: UpdateRawMaterialDto): Promise<RawMaterialResponseDto> {
    const rm = await this.rawMaterialsRepository.findOne({ where: { id } });
    if (!rm) throw new NotFoundException('Raw material not found');
    if (updateDto.code && updateDto.code !== rm.code) {
      const existing = await this.rawMaterialsRepository.findOne({ where: { code: updateDto.code } });
      if (existing) throw new BadRequestException('Raw material with this code already exists');
    }
    Object.assign(rm, updateDto);
    const updated = await this.rawMaterialsRepository.save(rm);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const rm = await this.rawMaterialsRepository.findOne({ where: { id } });
    if (!rm) throw new NotFoundException('Raw material not found');
    await this.rawMaterialsRepository.remove(rm);
  }

  private async toResponseDto(rm: RawMaterial): Promise<RawMaterialResponseDto> {
    let supplier: { id: number; name: string; contactPerson: string; email: string; phone: string } | undefined;
    if (rm.supplierId) {
      const s = await this.suppliersRepository.findOne({ where: { id: rm.supplierId } });
      if (s) supplier = { id: s.id, name: s.name, contactPerson: s.contactPerson, email: s.email, phone: s.phone };
    }
    return {
      id: rm.id,
      code: rm.code,
      name: rm.name,
      description: rm.description,
      grade: rm.grade,
      storageRequirements: rm.storageRequirements,
      unit: rm.unit,
      supplierId: rm.supplierId,
      supplier,
      status: rm.status,
      createdAt: rm.createdAt,
      updatedAt: rm.updatedAt,
    };
  }
}

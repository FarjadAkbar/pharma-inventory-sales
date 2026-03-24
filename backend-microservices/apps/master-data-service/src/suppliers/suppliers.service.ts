import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { Site } from '../entities/site.entity';
import { CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto } from '@repo/shared';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier) private suppliersRepository: Repository<Supplier>,
    @InjectRepository(Site) private sitesRepository: Repository<Site>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = this.suppliersRepository.create(createSupplierDto);
    const saved = await this.suppliersRepository.save(supplier);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<SupplierResponseDto[]> {
    const suppliers = await this.suppliersRepository.find({ order: { createdAt: 'DESC' } });
    return Promise.all(suppliers.map((s) => this.toResponseDto(s)));
  }

  async findOne(id: number): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.toResponseDto(supplier);
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    Object.assign(supplier, updateSupplierDto);
    const updated = await this.suppliersRepository.save(supplier);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    await this.suppliersRepository.remove(supplier);
    return { success: true };
  }

  private async toResponseDto(supplier: Supplier): Promise<SupplierResponseDto> {
    const raw = supplier.siteIds as string | number[] | undefined;
    const siteIds = Array.isArray(raw)
      ? raw
      : typeof raw === 'string' && raw
        ? raw.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id))
        : [];
    let sites: Array<{ id: number; name: string; address?: string; city?: string; type?: string }> = [];
    if (siteIds.length > 0) {
      const siteList = await this.sitesRepository.find({ where: { id: In(siteIds) } });
      sites = siteList.map((s) => ({ id: s.id, name: s.name, address: s.address, city: s.city, type: s.type }));
    }
    return {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      rating: Number(supplier.rating),
      status: supplier.status,
      siteIds: siteIds.length > 0 ? siteIds : undefined,
      sites: sites.length > 0 ? sites : undefined,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}

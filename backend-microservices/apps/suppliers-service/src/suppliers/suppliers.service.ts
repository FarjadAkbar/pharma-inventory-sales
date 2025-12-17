import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Supplier } from '../entities/supplier.entity';
import { 
  CreateSupplierDto, 
  UpdateSupplierDto, 
  SupplierResponseDto,
  SITE_PATTERNS,
} from '@repo/shared';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @Inject('SITE_SERVICE')
    private siteClient: ClientProxy,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = this.suppliersRepository.create(createSupplierDto);
    const saved = await this.suppliersRepository.save(supplier);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<SupplierResponseDto[]> {
    const suppliers = await this.suppliersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return Promise.all(suppliers.map(supplier => this.toResponseDto(supplier)));
  }

  async findOne(id: number): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return this.toResponseDto(supplier);
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    Object.assign(supplier, updateSupplierDto);
    const updated = await this.suppliersRepository.save(supplier);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    await this.suppliersRepository.remove(supplier);
  }

  private async toResponseDto(supplier: Supplier): Promise<SupplierResponseDto> {
    const siteIds = supplier.siteIds || [];
    const sites = [];

    // Fetch site details for each siteId
    if (siteIds.length > 0) {
      for (const siteId of siteIds) {
        try {
          const site = await firstValueFrom(
            this.siteClient.send(SITE_PATTERNS.GET_BY_ID, siteId)
          );
          if (site) {
            sites.push({
              id: site.id,
              name: site.name,
              address: site.address,
              city: site.city,
              type: site.type,
            });
          }
        } catch (error) {
          // If site not found, skip it
          console.warn(`Site ${siteId} not found for supplier ${supplier.id}`);
        }
      }
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


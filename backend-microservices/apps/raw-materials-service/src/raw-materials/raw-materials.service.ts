import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RawMaterial } from '../entities/raw-material.entity';
import { 
  CreateRawMaterialDto, 
  UpdateRawMaterialDto, 
  RawMaterialResponseDto,
  SUPPLIER_PATTERNS,
} from '@repo/shared';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectRepository(RawMaterial)
    private rawMaterialsRepository: Repository<RawMaterial>,
    @Inject('SUPPLIER_SERVICE')
    private supplierClient: ClientProxy,
  ) {}

  async create(createRawMaterialDto: CreateRawMaterialDto): Promise<RawMaterialResponseDto> {
    // Check if code already exists
    const existing = await this.rawMaterialsRepository.findOne({ 
      where: { code: createRawMaterialDto.code } 
    });
    if (existing) {
      throw new Error('Raw material with this code already exists');
    }

    const rawMaterial = this.rawMaterialsRepository.create(createRawMaterialDto);
    const saved = await this.rawMaterialsRepository.save(rawMaterial);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<RawMaterialResponseDto[]> {
    const rawMaterials = await this.rawMaterialsRepository.find({
      order: { createdAt: 'DESC' },
    });
    return Promise.all(rawMaterials.map(rm => this.toResponseDto(rm)));
  }

  async findOne(id: number): Promise<RawMaterialResponseDto> {
    const rawMaterial = await this.rawMaterialsRepository.findOne({ where: { id } });
    if (!rawMaterial) {
      throw new NotFoundException('Raw material not found');
    }
    return this.toResponseDto(rawMaterial);
  }

  async findBySupplierId(supplierId: number): Promise<RawMaterialResponseDto[]> {
    const rawMaterials = await this.rawMaterialsRepository.find({
      where: { supplierId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(rawMaterials.map(rm => this.toResponseDto(rm)));
  }

  async update(id: number, updateRawMaterialDto: UpdateRawMaterialDto): Promise<RawMaterialResponseDto> {
    const rawMaterial = await this.rawMaterialsRepository.findOne({ where: { id } });
    if (!rawMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    // Check if code is being updated and if it already exists
    if (updateRawMaterialDto.code && updateRawMaterialDto.code !== rawMaterial.code) {
      const existing = await this.rawMaterialsRepository.findOne({ 
        where: { code: updateRawMaterialDto.code } 
      });
      if (existing) {
        throw new Error('Raw material with this code already exists');
      }
    }

    Object.assign(rawMaterial, updateRawMaterialDto);
    const updated = await this.rawMaterialsRepository.save(rawMaterial);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const rawMaterial = await this.rawMaterialsRepository.findOne({ where: { id } });
    if (!rawMaterial) {
      throw new NotFoundException('Raw material not found');
    }
    await this.rawMaterialsRepository.remove(rawMaterial);
  }

  private async toResponseDto(rawMaterial: RawMaterial): Promise<RawMaterialResponseDto> {
    let supplier = undefined;

    // Fetch supplier details
    if (rawMaterial.supplierId) {
      try {
        const supplierData = await firstValueFrom(
          this.supplierClient.send(SUPPLIER_PATTERNS.GET_BY_ID, rawMaterial.supplierId)
        );
        if (supplierData) {
          supplier = {
            id: supplierData.id,
            name: supplierData.name,
            contactPerson: supplierData.contactPerson,
            email: supplierData.email,
            phone: supplierData.phone,
          };
        }
      } catch (error) {
        // If supplier not found, skip it
        console.warn(`Supplier ${rawMaterial.supplierId} not found for raw material ${rawMaterial.id}`);
      }
    }

    return {
      id: rawMaterial.id,
      code: rawMaterial.code,
      name: rawMaterial.name,
      description: rawMaterial.description,
      grade: rawMaterial.grade,
      storageRequirements: rawMaterial.storageRequirements,
      unit: rawMaterial.unit,
      supplierId: rawMaterial.supplierId,
      supplier: supplier,
      status: rawMaterial.status,
      createdAt: rawMaterial.createdAt,
      updatedAt: rawMaterial.updatedAt,
    };
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierInvoice } from '../entities/supplier-invoice.entity';
import {
  CreateSupplierInvoiceDto,
  UpdateSupplierInvoiceDto,
  SupplierInvoiceResponseDto,
  SupplierInvoiceStatus,
} from '@repo/shared';

@Injectable()
export class SupplierInvoicesService {
  constructor(
    @InjectRepository(SupplierInvoice)
    private repo: Repository<SupplierInvoice>,
  ) {}

  async create(dto: CreateSupplierInvoiceDto): Promise<SupplierInvoiceResponseDto> {
    const entity = this.repo.create({
      invoiceNumber: dto.invoiceNumber,
      supplierId: dto.supplierId,
      purchaseOrderId: dto.purchaseOrderId,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      dueDate: new Date(dto.dueDate),
      notes: dto.notes,
      status: dto.status || SupplierInvoiceStatus.DRAFT,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findAll(): Promise<SupplierInvoiceResponseDto[]> {
    const list = await this.repo.find({ order: { createdAt: 'DESC' } });
    return list.map((e) => this.toDto(e));
  }

  async findOne(id: number): Promise<SupplierInvoiceResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Supplier invoice not found');
    return this.toDto(entity);
  }

  async update(id: number, dto: UpdateSupplierInvoiceDto): Promise<SupplierInvoiceResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Supplier invoice not found');
    if (dto.invoiceNumber !== undefined) entity.invoiceNumber = dto.invoiceNumber;
    if (dto.supplierId !== undefined) entity.supplierId = dto.supplierId;
    if (dto.purchaseOrderId !== undefined) entity.purchaseOrderId = dto.purchaseOrderId;
    if (dto.amount !== undefined) entity.amount = dto.amount;
    if (dto.currency !== undefined) entity.currency = dto.currency;
    if (dto.dueDate !== undefined) entity.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) entity.notes = dto.notes;
    if (dto.status !== undefined) entity.status = dto.status;
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Supplier invoice not found');
    await this.repo.remove(entity);
  }

  private toDto(e: SupplierInvoice): SupplierInvoiceResponseDto {
    return {
      id: e.id,
      invoiceNumber: e.invoiceNumber,
      supplierId: e.supplierId,
      purchaseOrderId: e.purchaseOrderId ?? undefined,
      amount: Number(e.amount),
      currency: e.currency,
      dueDate: e.dueDate,
      status: e.status as SupplierInvoiceStatus,
      notes: e.notes,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}

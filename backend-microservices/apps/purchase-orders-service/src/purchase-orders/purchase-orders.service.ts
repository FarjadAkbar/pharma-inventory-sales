import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { 
  CreatePurchaseOrderDto, 
  UpdatePurchaseOrderDto,
  PurchaseOrderResponseDto,
  PurchaseOrderItemResponseDto,
  PurchaseOrderStatus,
  SITE_PATTERNS,
  RAW_MATERIAL_PATTERNS,
  SUPPLIER_PATTERNS,
} from '@repo/shared';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @Inject('SITE_SERVICE')
    private siteClient: ClientProxy,
    @Inject('RAW_MATERIAL_SERVICE')
    private rawMaterialClient: ClientProxy,
    @Inject('SUPPLIER_SERVICE')
    private supplierClient: ClientProxy,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    // Generate PO number
    const poNumber = await this.generatePONumber();

    // Calculate total amount
    const totalAmount = createDto.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Create purchase order with items in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseOrder = this.purchaseOrderRepository.create({
        poNumber,
        supplierId: createDto.supplierId,
        siteId: createDto.siteId,
        expectedDate: new Date(createDto.expectedDate),
        status: createDto.status || PurchaseOrderStatus.DRAFT,
        totalAmount,
      });

      const savedPO = await queryRunner.manager.save(PurchaseOrder, purchaseOrder);

      const items = createDto.items.map(item => {
        return this.purchaseOrderItemRepository.create({
          purchaseOrderId: savedPO.id,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        });
      });

      await queryRunner.manager.save(PurchaseOrderItem, items);

      await queryRunner.commitTransaction();

      // Reload with items for response
      const poWithItems = await this.purchaseOrderRepository.findOne({
        where: { id: savedPO.id },
        relations: ['items'],
      });

      return this.toResponseDto(poWithItems!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<PurchaseOrderResponseDto[]> {
    const purchaseOrders = await this.purchaseOrderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(purchaseOrders.map(po => this.toResponseDto(po)));
  }

  async findOne(id: number): Promise<PurchaseOrderResponseDto> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }
    
    // Load items if not already loaded
    if (!purchaseOrder.items) {
      purchaseOrder.items = await this.purchaseOrderItemRepository.find({
        where: { purchaseOrderId: id },
      });
    }
    
    return this.toResponseDto(purchaseOrder);
  }

  async update(id: number, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update purchase order fields
      if (updateDto.supplierId !== undefined) purchaseOrder.supplierId = updateDto.supplierId;
      if (updateDto.siteId !== undefined) purchaseOrder.siteId = updateDto.siteId;
      if (updateDto.expectedDate) purchaseOrder.expectedDate = new Date(updateDto.expectedDate);
      if (updateDto.status) purchaseOrder.status = updateDto.status;

      // Update items if provided
      if (updateDto.items) {
        // Delete existing items
        await queryRunner.manager.delete(PurchaseOrderItem, { purchaseOrderId: id });

        // Create new items
        const items = updateDto.items.map(item => {
          return this.purchaseOrderItemRepository.create({
            purchaseOrderId: id,
            rawMaterialId: item.rawMaterialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          });
        });

        await queryRunner.manager.save(PurchaseOrderItem, items);

        // Recalculate total amount
        purchaseOrder.totalAmount = updateDto.items.reduce((sum, item) => {
          return sum + (item.quantity * item.unitPrice);
        }, 0);
      }

      const updated = await queryRunner.manager.save(PurchaseOrder, purchaseOrder);
      await queryRunner.commitTransaction();

      // Reload with items for response
      const poWithItems = await this.purchaseOrderRepository.findOne({
        where: { id },
        relations: ['items'],
      });

      return this.toResponseDto(poWithItems!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<void> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }
    await this.purchaseOrderRepository.remove(purchaseOrder);
  }

  async approve(id: number): Promise<PurchaseOrderResponseDto> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ 
      where: { id },
      relations: ['items'],
    });
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }
    purchaseOrder.status = PurchaseOrderStatus.APPROVED;
    const updated = await this.purchaseOrderRepository.save(purchaseOrder);
    
    // Load items for response
    if (!updated.items) {
      updated.items = await this.purchaseOrderItemRepository.find({
        where: { purchaseOrderId: id },
      });
    }
    
    return this.toResponseDto(updated);
  }

  async cancel(id: number): Promise<PurchaseOrderResponseDto> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ 
      where: { id },
      relations: ['items'],
    });
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }
    purchaseOrder.status = PurchaseOrderStatus.CANCELLED;
    const updated = await this.purchaseOrderRepository.save(purchaseOrder);
    
    // Load items for response
    if (!updated.items) {
      updated.items = await this.purchaseOrderItemRepository.find({
        where: { purchaseOrderId: id },
      });
    }
    
    return this.toResponseDto(updated);
  }

  private async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    
    const count = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .where('po.createdAt >= :startOfYear', { startOfYear })
      .andWhere('po.createdAt <= :endOfYear', { endOfYear })
      .getCount();
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `PO-${year}-${sequence}`;
  }

  private async toResponseDto(purchaseOrder: PurchaseOrder): Promise<PurchaseOrderResponseDto> {
    // Fetch supplier details
    let supplier = null;
    try {
      supplier = await firstValueFrom(
        this.supplierClient.send(SUPPLIER_PATTERNS.GET_BY_ID, purchaseOrder.supplierId)
      );
    } catch (error) {
      console.warn(`Supplier ${purchaseOrder.supplierId} not found for PO ${purchaseOrder.id}`);
    }

    // Fetch site details if siteId exists
    let site = null;
    if (purchaseOrder.siteId) {
      try {
        site = await firstValueFrom(
          this.siteClient.send(SITE_PATTERNS.GET_BY_ID, purchaseOrder.siteId)
        );
      } catch (error) {
        console.warn(`Site ${purchaseOrder.siteId} not found for PO ${purchaseOrder.id}`);
      }
    }

    // Fetch raw material details for items
    const items: PurchaseOrderItemResponseDto[] = [];
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      for (const item of purchaseOrder.items) {
        let rawMaterial = null;
        try {
          rawMaterial = await firstValueFrom(
            this.rawMaterialClient.send(RAW_MATERIAL_PATTERNS.GET_BY_ID, item.rawMaterialId)
          );
        } catch (error) {
          console.warn(`Raw material ${item.rawMaterialId} not found for PO item ${item.id}`);
        }

        items.push({
          id: item.id,
          purchaseOrderId: item.purchaseOrderId,
          rawMaterialId: item.rawMaterialId,
          rawMaterial: rawMaterial ? {
            id: rawMaterial.id,
            name: rawMaterial.name,
            code: rawMaterial.code,
          } : undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }
    }

    return {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      supplierId: purchaseOrder.supplierId,
      supplier: supplier ? {
        id: supplier.id,
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
      } : undefined,
      siteId: purchaseOrder.siteId || undefined,
      site: site ? {
        id: site.id,
        name: site.name,
        address: site.address,
        city: site.city,
      } : undefined,
      expectedDate: purchaseOrder.expectedDate,
      status: purchaseOrder.status,
      totalAmount: Number(purchaseOrder.totalAmount),
      items: items.length > 0 ? items : undefined,
      createdAt: purchaseOrder.createdAt,
      updatedAt: purchaseOrder.updatedAt,
    };
  }
}


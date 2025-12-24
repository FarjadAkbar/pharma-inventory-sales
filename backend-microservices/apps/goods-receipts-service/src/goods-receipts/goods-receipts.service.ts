import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { GoodsReceipt } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../entities/goods-receipt-item.entity';
import { 
  CreateGoodsReceiptDto, 
  UpdateGoodsReceiptDto, 
  GoodsReceiptResponseDto,
  GoodsReceiptItemResponseDto,
  PURCHASE_ORDER_PATTERNS,
  PurchaseOrderStatus,
  PurchaseOrderResponseDto,
  GoodsReceiptStatus,
  QC_SAMPLE_PATTERNS,
  CreateQCSampleDto,
  QCSampleSourceType,
  RAW_MATERIAL_PATTERNS,
} from '@repo/shared';

@Injectable()
export class GoodsReceiptsService {
  constructor(
    @InjectRepository(GoodsReceipt)
    private goodsReceiptsRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptItem)
    private goodsReceiptItemsRepository: Repository<GoodsReceiptItem>,
    @Inject('PURCHASE_ORDER_SERVICE')
    private purchaseOrderClient: ClientProxy,
    @Inject('QC_SAMPLE_SERVICE')
    private qcSampleClient: ClientProxy,
    @Inject('RAW_MATERIAL_SERVICE')
    private rawMaterialClient: ClientProxy,
  ) {}

  async generateGRNNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GRN-${year}-`;
    
    // Find the highest sequence number for this year
    const lastGRN = await this.goodsReceiptsRepository
      .createQueryBuilder('gr')
      .where('gr.grnNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('gr.grnNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastGRN) {
      const lastSequence = parseInt(lastGRN.grnNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createGoodsReceiptDto: CreateGoodsReceiptDto): Promise<GoodsReceiptResponseDto> {
    // Verify PO exists and is approved
    console.log(`[GoodsReceiptsService] Creating goods receipt for PO ID: ${createGoodsReceiptDto.purchaseOrderId}`);
    console.log(`[GoodsReceiptsService] Using pattern: ${JSON.stringify(PURCHASE_ORDER_PATTERNS.GET_BY_ID)}`);
    
    let purchaseOrder: PurchaseOrderResponseDto;
    try {
      purchaseOrder = await firstValueFrom(
        this.purchaseOrderClient.send<PurchaseOrderResponseDto>(PURCHASE_ORDER_PATTERNS.GET_BY_ID, createGoodsReceiptDto.purchaseOrderId)
      );
      console.log(`[GoodsReceiptsService] Successfully fetched purchase order: ${purchaseOrder?.id}, status: ${purchaseOrder?.status}`);
    } catch (error: any) {
      console.error('Error fetching purchase order:', {
        error: error?.message || error,
        name: error?.name,
        code: error?.code,
        purchaseOrderId: createGoodsReceiptDto.purchaseOrderId,
        pattern: PURCHASE_ORDER_PATTERNS.GET_BY_ID
      });
      
      // Check for "no matching handler" error - means service isn't running or pattern doesn't match
      if (error?.message?.includes('no matching message handler') || error?.message?.includes('There is no matching message handler')) {
        const configuredPort = process.env.PURCHASE_ORDER_SERVICE_PORT || '3009';
        const configuredHost = process.env.PURCHASE_ORDER_SERVICE_HOST || 'localhost';
        const expectedPort = '3009'; // Purchase order service default port
        
        throw new BadRequestException(
          `Cannot connect to Purchase Order Service. ` +
          `Configured to connect to ${configuredHost}:${configuredPort}, but the service may be running on port ${expectedPort}. ` +
          `Please check your .env file: set PURCHASE_ORDER_SERVICE_PORT=${expectedPort} if the service is running on port ${expectedPort}, ` +
          `or ensure the purchase order service is running on port ${configuredPort}. ` +
          `Pattern sent: ${JSON.stringify(PURCHASE_ORDER_PATTERNS.GET_BY_ID)}`
        );
      }
      
      // Check if it's a NotFoundException from the purchase order service
      if (error?.status === 404 || error?.message?.toLowerCase().includes('not found')) {
        throw new NotFoundException(`Purchase order ${createGoodsReceiptDto.purchaseOrderId} not found`);
      }
      
      // Re-throw NotFoundException as-is
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // For other errors
      throw new BadRequestException(`Failed to fetch purchase order: ${error?.message || 'Unknown error'}`);
    }
    
    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException('Purchase order must be approved before creating goods receipt');
    }

    // Generate GRN number
    const grnNumber = await this.generateGRNNumber();

    // Validate received quantities don't exceed ordered quantities
    for (const item of createGoodsReceiptDto.items) {
      const poItem = purchaseOrder.items?.find((pi: any) => pi.id === item.purchaseOrderItemId);
      if (!poItem) {
        throw new NotFoundException(`Purchase order item ${item.purchaseOrderItemId} not found`);
      }

      if (item.receivedQuantity > poItem.quantity) {
        throw new BadRequestException(`Received quantity (${item.receivedQuantity}) exceeds ordered quantity (${poItem.quantity}) for item ${item.purchaseOrderItemId}`);
      }

      if (item.acceptedQuantity + item.rejectedQuantity !== item.receivedQuantity) {
        throw new BadRequestException(`Accepted quantity + rejected quantity must equal received quantity for item ${item.purchaseOrderItemId}`);
      }
    }

    // Create goods receipt
    const goodsReceipt = this.goodsReceiptsRepository.create({
      grnNumber,
      purchaseOrderId: createGoodsReceiptDto.purchaseOrderId,
      receivedDate: new Date(createGoodsReceiptDto.receivedDate),
      status: createGoodsReceiptDto.status || GoodsReceiptStatus.DRAFT,
      remarks: createGoodsReceiptDto.remarks,
    });

    const saved = await this.goodsReceiptsRepository.save(goodsReceipt) as GoodsReceipt;

    // Create items
    const items = createGoodsReceiptDto.items.map(itemDto => {
      const item = this.goodsReceiptItemsRepository.create({
        goodsReceiptId: saved.id,
        purchaseOrderItemId: itemDto.purchaseOrderItemId,
        receivedQuantity: itemDto.receivedQuantity,
        acceptedQuantity: itemDto.acceptedQuantity,
        rejectedQuantity: itemDto.rejectedQuantity,
        batchNumber: itemDto.batchNumber,
        expiryDate: itemDto.expiryDate ? new Date(itemDto.expiryDate) : undefined,
      });
      return item;
    });

    await this.goodsReceiptItemsRepository.save(items);

    // Create QC samples for accepted items (if any) - don't fail if this errors
    try {
      await this.createQCSamplesForItems(saved, items, purchaseOrder);
    } catch (error) {
      console.error('Error creating QC samples (non-critical):', error);
      // Continue - QC sample creation failure shouldn't prevent GR creation
    }

    return this.toResponseDto(saved, items);
  }

  async findAll(): Promise<GoodsReceiptResponseDto[]> {
    const goodsReceipts = await this.goodsReceiptsRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(goodsReceipts.map(gr => this.toResponseDto(gr, gr.items)));
  }

  private async createQCSamplesForItems(
    goodsReceipt: GoodsReceipt,
    items: GoodsReceiptItem[],
    purchaseOrder: PurchaseOrderResponseDto,
  ): Promise<void> {
    // Only create samples for items with accepted quantity > 0
    const acceptedItems = items.filter(item => item.acceptedQuantity > 0);

    for (const item of acceptedItems) {
      try {
        // Get raw material details from PO item
        const poItem = purchaseOrder.items?.find((pi: any) => pi.id === item.purchaseOrderItemId);
        if (!poItem) {
          console.warn(`PO item ${item.purchaseOrderItemId} not found for GR item ${item.id}`);
          continue;
        }

        // Get raw material details
        let rawMaterial: any = null;
        try {
          rawMaterial = await firstValueFrom(
            this.rawMaterialClient.send(RAW_MATERIAL_PATTERNS.GET_BY_ID, poItem.rawMaterialId)
          );
        } catch (error) {
          console.warn(`Raw material ${poItem.rawMaterialId} not found for GR item ${item.id}`);
          continue;
        }

        if (!rawMaterial) {
          continue;
        }

        // Create QC sample request
        const createQCSampleDto: CreateQCSampleDto = {
          sourceType: QCSampleSourceType.GOODS_RECEIPT,
          sourceId: goodsReceipt.id,
          sourceReference: goodsReceipt.grnNumber,
          goodsReceiptItemId: item.id,
          materialId: rawMaterial.id,
          materialName: rawMaterial.name,
          materialCode: rawMaterial.code,
          batchNumber: item.batchNumber || `BATCH-${item.id}`,
          quantity: item.acceptedQuantity,
          unit: rawMaterial.unit || 'kg',
          requestedBy: 1, // TODO: Get from authenticated user context
        };

        try {
          await firstValueFrom(
            this.qcSampleClient.send(QC_SAMPLE_PATTERNS.CREATE, createQCSampleDto)
          );
        } catch (error) {
          console.error(`Failed to create QC sample for GR item ${item.id}:`, error);
          // Don't throw - continue with other items
        }
      } catch (error) {
        console.error(`Error processing QC sample for GR item ${item.id}:`, error);
        // Continue with other items
      }
    }
  }

  async findOne(id: number): Promise<GoodsReceiptResponseDto> {
    const goodsReceipt = await this.goodsReceiptsRepository.findOne({ 
      where: { id },
      relations: ['items'],
    });
    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }
    return this.toResponseDto(goodsReceipt, goodsReceipt.items);
  }

  async update(id: number, updateGoodsReceiptDto: UpdateGoodsReceiptDto): Promise<GoodsReceiptResponseDto> {
    const goodsReceipt = await this.goodsReceiptsRepository.findOne({ 
      where: { id },
      relations: ['items'],
    });
    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }

    // Update main fields
    if (updateGoodsReceiptDto.receivedDate) {
      goodsReceipt.receivedDate = new Date(updateGoodsReceiptDto.receivedDate);
    }
    if (updateGoodsReceiptDto.remarks !== undefined) {
      goodsReceipt.remarks = updateGoodsReceiptDto.remarks;
    }
    if (updateGoodsReceiptDto.status) {
      goodsReceipt.status = updateGoodsReceiptDto.status;
    }

    const updated = await this.goodsReceiptsRepository.save(goodsReceipt);

    // Update items if provided
    if (updateGoodsReceiptDto.items) {
      // Delete existing items
      await this.goodsReceiptItemsRepository.delete({ goodsReceiptId: id });

      // Create new items
      const items = updateGoodsReceiptDto.items.map(itemDto => {
        const item = this.goodsReceiptItemsRepository.create({
          goodsReceiptId: id,
          purchaseOrderItemId: itemDto.purchaseOrderItemId,
          receivedQuantity: itemDto.receivedQuantity,
          acceptedQuantity: itemDto.acceptedQuantity,
          rejectedQuantity: itemDto.rejectedQuantity,
          batchNumber: itemDto.batchNumber,
          expiryDate: itemDto.expiryDate ? new Date(itemDto.expiryDate) : undefined,
        });
        return item;
      });

      await this.goodsReceiptItemsRepository.save(items);
      updated.items = items;
    }

    return this.toResponseDto(updated, updated.items);
  }

  async delete(id: number): Promise<void> {
    const goodsReceipt = await this.goodsReceiptsRepository.findOne({ where: { id } });
    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }
    await this.goodsReceiptsRepository.remove(goodsReceipt);
  }

  private async toResponseDto(goodsReceipt: GoodsReceipt, items?: GoodsReceiptItem[]): Promise<GoodsReceiptResponseDto> {
    // Fetch purchase order details
    let purchaseOrder: PurchaseOrderResponseDto | null = null;
    try {
      purchaseOrder = await firstValueFrom(
        this.purchaseOrderClient.send<PurchaseOrderResponseDto>(PURCHASE_ORDER_PATTERNS.GET_BY_ID, goodsReceipt.purchaseOrderId)
      );
    } catch (error) {
      console.warn(`Purchase order ${goodsReceipt.purchaseOrderId} not found for goods receipt ${goodsReceipt.id}`);
    }

    const itemsData: GoodsReceiptItemResponseDto[] = (items || []).map(item => ({
      id: item.id,
      goodsReceiptId: item.goodsReceiptId,
      purchaseOrderItemId: item.purchaseOrderItemId,
      receivedQuantity: Number(item.receivedQuantity),
      acceptedQuantity: Number(item.acceptedQuantity),
      rejectedQuantity: Number(item.rejectedQuantity),
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      id: goodsReceipt.id,
      grnNumber: goodsReceipt.grnNumber,
      purchaseOrderId: goodsReceipt.purchaseOrderId,
      purchaseOrder: purchaseOrder ? {
        id: purchaseOrder.id,
        poNumber: purchaseOrder.poNumber,
        supplierId: purchaseOrder.supplierId,
        siteId: purchaseOrder.siteId,
      } : undefined,
      receivedDate: goodsReceipt.receivedDate,
      status: goodsReceipt.status,
      remarks: goodsReceipt.remarks,
      items: itemsData,
      createdAt: goodsReceipt.createdAt,
      updatedAt: goodsReceipt.updatedAt,
    };
  }
}


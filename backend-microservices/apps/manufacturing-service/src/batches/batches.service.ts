import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Batch } from '../entities/batch.entity';
import { WorkOrder } from '../entities/work-order.entity';
import {
  CreateBatchDto,
  StartBatchDto,
  CompleteBatchDto,
  SubmitBatchToQCDto,
  ReceiveFinishedGoodsDto,
  BatchResponseDto,
  BatchStatus,
  WAREHOUSE_PATTERNS,
  QC_SAMPLE_PATTERNS,
  CreateQCSampleDto,
  CreatePutawayItemDto,
  QCSampleResponseDto,
  PutawayItemResponseDto,
  QCSampleSourceType,
  QCSamplePriority,
} from '@repo/shared';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
    @InjectRepository(WorkOrder)
    private workOrdersRepository: Repository<WorkOrder>,
    @Inject('WAREHOUSE_SERVICE')
    private warehouseClient: ClientProxy,
    @Inject('QUALITY_CONTROL_SERVICE')
    private qualityControlClient: ClientProxy,
  ) {}

  async generateBatchNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BATCH-${year}-`;
    
    const lastBatch = await this.batchesRepository
      .createQueryBuilder('batch')
      .where('batch.batchNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('batch.batchNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastBatch) {
      const lastSequence = parseInt(lastBatch.batchNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createDto: CreateBatchDto): Promise<BatchResponseDto> {
    // Verify work order exists
    const workOrder = await this.workOrdersRepository.findOne({ where: { id: createDto.workOrderId } });
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${createDto.workOrderId} not found`);
    }

    const batchNumber = await this.generateBatchNumber();

    const batch = this.batchesRepository.create({
      batchNumber,
      workOrderId: createDto.workOrderId,
      workOrderNumber: createDto.workOrderNumber,
      drugId: createDto.drugId,
      drugName: createDto.drugName,
      drugCode: createDto.drugCode,
      siteId: createDto.siteId,
      siteName: createDto.siteName,
      plannedQuantity: createDto.plannedQuantity,
      unit: createDto.unit,
      bomVersion: createDto.bomVersion,
      status: createDto.status || BatchStatus.DRAFT,
      priority: createDto.priority,
      plannedStartDate: new Date(createDto.plannedStartDate),
      plannedEndDate: new Date(createDto.plannedEndDate),
      createdBy: createDto.createdBy,
      remarks: createDto.remarks,
    });

    const saved = await this.batchesRepository.save(batch);
    return this.toResponseDto(saved);
  }

  async findAll(params?: {
    search?: string;
    drugId?: number;
    siteId?: number;
    status?: BatchStatus;
    workOrderId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ batches: BatchResponseDto[]; pagination: { page: number; pages: number; total: number } }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.batchesRepository.createQueryBuilder('batch');

    if (params?.drugId) {
      queryBuilder.andWhere('batch.drugId = :drugId', { drugId: params.drugId });
    }
    if (params?.siteId) {
      queryBuilder.andWhere('batch.siteId = :siteId', { siteId: params.siteId });
    }
    if (params?.status) {
      queryBuilder.andWhere('batch.status = :status', { status: params.status });
    }
    if (params?.workOrderId) {
      queryBuilder.andWhere('batch.workOrderId = :workOrderId', { workOrderId: params.workOrderId });
    }
    if (params?.search) {
      queryBuilder.andWhere(
        '(batch.batchNumber LIKE :search OR batch.drugName LIKE :search OR batch.drugCode LIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    queryBuilder.orderBy('batch.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [batches, total] = await queryBuilder.getManyAndCount();

    return {
      batches: batches.map(batch => this.toResponseDto(batch)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async findOne(id: number): Promise<BatchResponseDto> {
    const batch = await this.batchesRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return this.toResponseDto(batch);
  }

  async findByWorkOrder(workOrderId: number): Promise<BatchResponseDto[]> {
    const batches = await this.batchesRepository.find({
      where: { workOrderId },
      order: { createdAt: 'DESC' },
    });
    return batches.map(batch => this.toResponseDto(batch));
  }

  async start(id: number, startDto: StartBatchDto): Promise<BatchResponseDto> {
    const batch = await this.batchesRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (batch.status !== BatchStatus.DRAFT && batch.status !== BatchStatus.PLANNED) {
      throw new BadRequestException(`Cannot start batch. Current status: ${batch.status}`);
    }

    // TODO: Check material availability via warehouse service
    // For now, we'll just update the batch status

    batch.status = BatchStatus.IN_PROGRESS;
    batch.startedBy = startDto.startedBy;
    batch.startedAt = startDto.actualStartDate ? new Date(startDto.actualStartDate) : new Date();
    batch.actualStartDate = batch.startedAt;

    if (startDto.remarks) {
      batch.remarks = batch.remarks 
        ? `${batch.remarks}\n\nStarted: ${startDto.remarks}`
        : startDto.remarks;
    }

    const updated = await this.batchesRepository.save(batch);
    return this.toResponseDto(updated);
  }

  async complete(id: number, completeDto: CompleteBatchDto): Promise<BatchResponseDto> {
    const batch = await this.batchesRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (batch.status !== BatchStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot complete batch. Current status: ${batch.status}`);
    }

    // TODO: Validate all steps are completed

    batch.actualQuantity = completeDto.actualQuantity;
    batch.hasFault = completeDto.hasFault || false;
    batch.faultDescription = completeDto.faultDescription;
    batch.completedBy = completeDto.completedBy;
    batch.completedAt = completeDto.actualEndDate ? new Date(completeDto.actualEndDate) : new Date();
    batch.actualEndDate = batch.completedAt;

    if (batch.hasFault) {
      // Batch will be submitted to QC separately
      batch.status = BatchStatus.QC_PENDING;
    } else {
      batch.status = BatchStatus.COMPLETED;
    }

    if (completeDto.remarks) {
      batch.remarks = batch.remarks 
        ? `${batch.remarks}\n\nCompleted: ${completeDto.remarks}`
        : completeDto.remarks;
    }

    const updated = await this.batchesRepository.save(batch);
    return this.toResponseDto(updated);
  }

  async submitToQC(id: number, submitDto: SubmitBatchToQCDto): Promise<BatchResponseDto> {
    const batch = await this.batchesRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (batch.status !== BatchStatus.QC_PENDING && batch.status !== BatchStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot submit batch to QC. Current status: ${batch.status}`);
    }

    // Create QC sample
    const qcSampleDto: CreateQCSampleDto = {
      sourceType: QCSampleSourceType.BATCH,
      sourceId: batch.id,
      sourceReference: batch.batchNumber,
      goodsReceiptItemId: undefined, // Not required for batch source
      materialId: batch.drugId,
      materialName: batch.drugName,
      materialCode: batch.drugCode,
      batchNumber: batch.batchNumber,
      quantity: submitDto.quantity,
      unit: submitDto.unit,
      priority: QCSamplePriority.HIGH,
      remarks: submitDto.remarks || submitDto.faultDescription,
      requestedBy: submitDto.requestedBy,
    };

    let qcSample: QCSampleResponseDto;
    try {
      qcSample = await firstValueFrom(
        this.qualityControlClient.send<QCSampleResponseDto>(QC_SAMPLE_PATTERNS.CREATE, qcSampleDto)
      );
    } catch (error) {
      throw new BadRequestException(`Failed to create QC sample: ${error.message}`);
    }

    batch.qcSampleId = qcSample.id;
    batch.status = BatchStatus.QC_PENDING;
    batch.hasFault = true;
    batch.faultDescription = submitDto.faultDescription;

    if (submitDto.remarks) {
      batch.remarks = batch.remarks 
        ? `${batch.remarks}\n\nSubmitted to QC: ${submitDto.remarks}`
        : submitDto.remarks;
    }

    const updated = await this.batchesRepository.save(batch);
    return this.toResponseDto(updated);
  }

  async receiveFinishedGoods(id: number, receiveDto: ReceiveFinishedGoodsDto): Promise<BatchResponseDto> {
    const batch = await this.batchesRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (batch.status !== BatchStatus.COMPLETED) {
      throw new BadRequestException(`Cannot receive finished goods. Batch must be completed. Current status: ${batch.status}`);
    }

    // Create putaway item via warehouse service
    const putawayDto: CreatePutawayItemDto = {
      materialId: batch.drugId,
      materialName: batch.drugName,
      materialCode: batch.drugCode,
      batchNumber: receiveDto.batchNumber,
      quantity: receiveDto.quantity,
      unit: receiveDto.unit,
      remarks: receiveDto.remarks || `Finished goods from batch ${batch.batchNumber}`,
      requestedBy: receiveDto.receivedBy,
    };

    let putawayItem: PutawayItemResponseDto;
    try {
      putawayItem = await firstValueFrom(
        this.warehouseClient.send<PutawayItemResponseDto>(WAREHOUSE_PATTERNS.PUTAWAY_CREATE, putawayDto)
      );
    } catch (error) {
      throw new BadRequestException(`Failed to create putaway item: ${error.message}`);
    }

    batch.putawayId = putawayItem.id;

    if (receiveDto.remarks) {
      batch.remarks = batch.remarks 
        ? `${batch.remarks}\n\nFinished goods received: ${receiveDto.remarks}`
        : receiveDto.remarks;
    }

    const updated = await this.batchesRepository.save(batch);
    return this.toResponseDto(updated);
  }

  private toResponseDto(batch: Batch): BatchResponseDto {
    return {
      id: batch.id,
      batchNumber: batch.batchNumber,
      workOrderId: batch.workOrderId,
      workOrderNumber: batch.workOrderNumber,
      drugId: batch.drugId,
      drugName: batch.drugName,
      drugCode: batch.drugCode,
      siteId: batch.siteId,
      siteName: batch.siteName,
      plannedQuantity: Number(batch.plannedQuantity),
      actualQuantity: batch.actualQuantity ? Number(batch.actualQuantity) : undefined,
      unit: batch.unit,
      bomVersion: batch.bomVersion,
      status: batch.status,
      priority: batch.priority,
      plannedStartDate: batch.plannedStartDate,
      plannedEndDate: batch.plannedEndDate,
      actualStartDate: batch.actualStartDate,
      actualEndDate: batch.actualEndDate,
      startedBy: batch.startedBy,
      startedByName: undefined, // Would be populated from user service
      startedAt: batch.startedAt,
      completedBy: batch.completedBy,
      completedByName: undefined, // Would be populated from user service
      completedAt: batch.completedAt,
      hasFault: batch.hasFault,
      faultDescription: batch.faultDescription,
      qcSampleId: batch.qcSampleId,
      putawayId: batch.putawayId,
      createdBy: batch.createdBy,
      createdByName: undefined, // Would be populated from user service
      remarks: batch.remarks,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    };
  }
}


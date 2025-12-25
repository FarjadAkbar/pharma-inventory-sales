import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QCSample } from '../entities/qc-sample.entity';
import { 
  CreateQCSampleDto, 
  UpdateQCSampleDto,
  QCSampleResponseDto,
  QCSampleStatus,
  QCSamplePriority,
  GOODS_RECEIPT_PATTERNS,
  GoodsReceiptResponseDto,
  AssignTestsToSampleDto,
  QC_TEST_PATTERNS,
} from '@repo/shared';

@Injectable()
export class QCSamplesService {
  constructor(
    @InjectRepository(QCSample)
    private qcSamplesRepository: Repository<QCSample>,
    @Inject('GOODS_RECEIPT_SERVICE')
    private goodsReceiptClient: ClientProxy,
    @Inject('QC_TEST_SERVICE')
    private qcTestClient: ClientProxy,
  ) {}

  async generateSampleNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QC-SAM-${year}-`;
    
    const lastSample = await this.qcSamplesRepository
      .createQueryBuilder('sample')
      .where('sample.sampleNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('sample.sampleNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastSample) {
      const lastSequence = parseInt(lastSample.sampleNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createQCSampleDto: CreateQCSampleDto): Promise<QCSampleResponseDto> {
    // Verify goods receipt item exists
    let goodsReceipt: GoodsReceiptResponseDto | null = null;
    try {
      console.log(createQCSampleDto, "createQCSampleDto")
      goodsReceipt = await firstValueFrom(
        this.goodsReceiptClient.send<GoodsReceiptResponseDto>(GOODS_RECEIPT_PATTERNS.GET_BY_ID, createQCSampleDto.sourceId)
      );
    } catch (error) {
      console.log(error, "error")
      throw new NotFoundException('Goods receipt not found');
    }

    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }

    // Verify goods receipt item exists
    const item = goodsReceipt.items?.find(i => i.id === createQCSampleDto.goodsReceiptItemId);
    if (!item) {
      throw new NotFoundException('Goods receipt item not found');
    }

    // Generate sample number
    const sampleNumber = await this.generateSampleNumber();

    // Create QC sample
    const qcSample = this.qcSamplesRepository.create({
      sampleNumber,
      sourceType: createQCSampleDto.sourceType,
      sourceId: createQCSampleDto.sourceId,
      sourceReference: createQCSampleDto.sourceReference,
      goodsReceiptItemId: createQCSampleDto.goodsReceiptItemId,
      materialId: createQCSampleDto.materialId,
      materialName: createQCSampleDto.materialName,
      materialCode: createQCSampleDto.materialCode,
      batchNumber: createQCSampleDto.batchNumber,
      quantity: createQCSampleDto.quantity,
      unit: createQCSampleDto.unit,
      priority: createQCSampleDto.priority || QCSamplePriority.NORMAL,
      status: QCSampleStatus.PENDING,
      requestedBy: createQCSampleDto.requestedBy,
      requestedAt: new Date(),
      dueDate: createQCSampleDto.dueDate ? new Date(createQCSampleDto.dueDate) : undefined,
      remarks: createQCSampleDto.remarks,
    });

    const saved = await this.qcSamplesRepository.save(qcSample);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<QCSampleResponseDto[]> {
    const samples = await this.qcSamplesRepository.find({
      order: { createdAt: 'DESC' },
    });
    return Promise.all(samples.map(sample => this.toResponseDto(sample)));
  }

  async findOne(id: number): Promise<QCSampleResponseDto> {
    const sample = await this.qcSamplesRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }
    return this.toResponseDto(sample);
  }

  async findByGoodsReceiptItem(goodsReceiptItemId: number): Promise<QCSampleResponseDto[]> {
    const samples = await this.qcSamplesRepository.find({
      where: { goodsReceiptItemId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(samples.map(sample => this.toResponseDto(sample)));
  }

  async update(id: number, updateQCSampleDto: UpdateQCSampleDto): Promise<QCSampleResponseDto> {
    const sample = await this.qcSamplesRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }

    if (updateQCSampleDto.status) {
      sample.status = updateQCSampleDto.status;
    }
    if (updateQCSampleDto.priority) {
      sample.priority = updateQCSampleDto.priority;
    }
    if (updateQCSampleDto.assignedTo !== undefined) {
      sample.assignedTo = updateQCSampleDto.assignedTo;
    }
    if (updateQCSampleDto.dueDate) {
      sample.dueDate = new Date(updateQCSampleDto.dueDate);
    }
    if (updateQCSampleDto.remarks !== undefined) {
      sample.remarks = updateQCSampleDto.remarks;
    }

    const updated = await this.qcSamplesRepository.save(sample);
    return this.toResponseDto(updated);
  }

  async receiveSample(id: number): Promise<QCSampleResponseDto> {
    const sample = await this.qcSamplesRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }

    if (sample.status !== QCSampleStatus.PENDING) {
      throw new BadRequestException('Sample can only be received when status is Pending');
    }

    sample.status = QCSampleStatus.SAMPLE_RECEIVED;
    const updated = await this.qcSamplesRepository.save(sample);
    return this.toResponseDto(updated);
  }

  async assignTests(id: number, assignTestsDto: AssignTestsToSampleDto): Promise<QCSampleResponseDto> {
    const sample = await this.qcSamplesRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }

    if (sample.status !== QCSampleStatus.SAMPLE_RECEIVED) {
      throw new BadRequestException('Tests can only be assigned when sample is received');
    }

    // Verify all tests exist
    for (const testId of assignTestsDto.testIds) {
      try {
        await firstValueFrom(
          this.qcTestClient.send(QC_TEST_PATTERNS.GET_BY_ID, testId)
        );
      } catch (error) {
        throw new NotFoundException(`QC test ${testId} not found`);
      }
    }

    sample.status = QCSampleStatus.TESTS_ASSIGNED;
    const updated = await this.qcSamplesRepository.save(sample);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const sample = await this.qcSamplesRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }
    await this.qcSamplesRepository.remove(sample);
  }

  private async toResponseDto(sample: QCSample): Promise<QCSampleResponseDto> {
    return {
      id: sample.id,
      sampleNumber: sample.sampleNumber,
      sourceType: sample.sourceType,
      sourceId: sample.sourceId,
      sourceReference: sample.sourceReference,
      goodsReceiptItemId: sample.goodsReceiptItemId,
      materialId: sample.materialId,
      materialName: sample.materialName,
      materialCode: sample.materialCode,
      batchNumber: sample.batchNumber,
      quantity: Number(sample.quantity),
      unit: sample.unit,
      priority: sample.priority,
      status: sample.status,
      assignedTo: sample.assignedTo,
      requestedBy: sample.requestedBy,
      requestedAt: sample.requestedAt,
      dueDate: sample.dueDate,
      remarks: sample.remarks,
      createdAt: sample.createdAt,
      updatedAt: sample.updatedAt,
    };
  }
}


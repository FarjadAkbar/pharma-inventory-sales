import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QARelease } from '../entities/qa-release.entity';
import { QAChecklistItem } from '../entities/qa-checklist-item.entity';
import { 
  CreateQAReleaseDto, 
  UpdateQAReleaseDto,
  QAReleaseResponseDto,
  QAReleaseStatus,
  QADecision,
  MakeReleaseDecisionDto,
  QC_SAMPLE_PATTERNS,
  QCSampleResponseDto,
  QCSampleStatus,
  QC_RESULT_PATTERNS,
  QCResultResponseDto,
  GOODS_RECEIPT_PATTERNS,
  GoodsReceiptResponseDto,
} from '@repo/shared';

@Injectable()
export class QAReleasesService {
  constructor(
    @InjectRepository(QARelease)
    private qaReleasesRepository: Repository<QARelease>,
    @InjectRepository(QAChecklistItem)
    private qaChecklistItemsRepository: Repository<QAChecklistItem>,
    @Inject('QC_SAMPLE_SERVICE')
    private qcSampleClient: ClientProxy,
    @Inject('QC_RESULT_SERVICE')
    private qcResultClient: ClientProxy,
    @Inject('GOODS_RECEIPT_SERVICE')
    private goodsReceiptClient: ClientProxy,
    private dataSource: DataSource,
  ) {}

  async generateReleaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QA-REL-${year}-`;
    
    const lastRelease = await this.qaReleasesRepository
      .createQueryBuilder('release')
      .where('release.releaseNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('release.releaseNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastRelease) {
      const lastSequence = parseInt(lastRelease.releaseNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createQAReleaseDto: CreateQAReleaseDto): Promise<QAReleaseResponseDto> {
    // Verify sample exists and is in correct status
    let sample: QCSampleResponseDto | null = null;
    try {
      sample = await firstValueFrom(
        this.qcSampleClient.send<QCSampleResponseDto>(QC_SAMPLE_PATTERNS.GET_BY_ID, createQAReleaseDto.sampleId)
      );
    } catch (error) {
      throw new NotFoundException('QC sample not found');
    }

    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }

    if (sample.status !== 'Submitted to QA' && sample.status !== 'QC Complete') {
      throw new BadRequestException('Sample must be submitted to QA or QC Complete before creating QA release');
    }

    // Verify all QC results exist and are submitted to QA
    for (const resultId of createQAReleaseDto.qcResultIds) {
      try {
        const result = await firstValueFrom(
          this.qcResultClient.send<QCResultResponseDto>(QC_RESULT_PATTERNS.GET_BY_ID, resultId)
        );
        if (!result || !result.submittedToQA) {
          throw new BadRequestException(`QC result ${resultId} must be submitted to QA`);
        }
        if (result.sampleId !== createQAReleaseDto.sampleId) {
          throw new BadRequestException(`QC result ${resultId} does not belong to sample ${createQAReleaseDto.sampleId}`);
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new NotFoundException(`QC result ${resultId} not found`);
      }
    }

    // Generate release number
    const releaseNumber = await this.generateReleaseNumber();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create QA release
      const qaRelease = this.qaReleasesRepository.create({
        releaseNumber,
        sampleId: createQAReleaseDto.sampleId,
        goodsReceiptItemId: createQAReleaseDto.goodsReceiptItemId,
        materialId: createQAReleaseDto.materialId,
        materialName: createQAReleaseDto.materialName,
        materialCode: createQAReleaseDto.materialCode,
        batchNumber: createQAReleaseDto.batchNumber,
        quantity: createQAReleaseDto.quantity,
        unit: createQAReleaseDto.unit,
        status: QAReleaseStatus.PENDING,
        qcResultIds: createQAReleaseDto.qcResultIds,
        submittedBy: createQAReleaseDto.submittedBy,
        submittedAt: new Date(),
        warehouseNotified: false,
      });

      const saved = await queryRunner.manager.save(QARelease, qaRelease);

      // Create default checklist items
      const defaultChecklistItems = [
        'All QC tests completed',
        'All QC results passed',
        'Documentation reviewed',
        'Batch records verified',
        'Compliance verified',
      ];

      const checklistItems = defaultChecklistItems.map(item => {
        return this.qaChecklistItemsRepository.create({
          releaseId: saved.id,
          item,
          checked: false,
        });
      });

      await queryRunner.manager.save(QAChecklistItem, checklistItems);

      await queryRunner.commitTransaction();

      // Reload with checklist items
      const releaseWithChecklist = await this.qaReleasesRepository.findOne({
        where: { id: saved.id },
        relations: ['checklistItems'],
      });

      return this.toResponseDto(releaseWithChecklist!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<QAReleaseResponseDto[]> {
    const releases = await this.qaReleasesRepository.find({
      relations: ['checklistItems'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(releases.map(release => this.toResponseDto(release)));
  }

  async findOne(id: number): Promise<QAReleaseResponseDto> {
    const release = await this.qaReleasesRepository.findOne({
      where: { id },
      relations: ['checklistItems'],
    });
    if (!release) {
      throw new NotFoundException('QA release not found');
    }
    return this.toResponseDto(release);
  }

  async findBySample(sampleId: number): Promise<QAReleaseResponseDto[]> {
    const releases = await this.qaReleasesRepository.find({
      where: { sampleId },
      relations: ['checklistItems'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(releases.map(release => this.toResponseDto(release)));
  }

  async update(id: number, updateQAReleaseDto: UpdateQAReleaseDto): Promise<QAReleaseResponseDto> {
    const release = await this.qaReleasesRepository.findOne({
      where: { id },
      relations: ['checklistItems'],
    });

    if (!release) {
      throw new NotFoundException('QA release not found');
    }

    if (release.status === QAReleaseStatus.RELEASED || release.status === QAReleaseStatus.HELD || release.status === QAReleaseStatus.REJECTED) {
      throw new BadRequestException('Cannot update release that has been decided');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updateQAReleaseDto.remarks !== undefined) {
        release.remarks = updateQAReleaseDto.remarks;
      }

      await queryRunner.manager.save(QARelease, release);

      // Update checklist items if provided
      if (updateQAReleaseDto.checklistItems) {
        // Delete existing checklist items
        await queryRunner.manager.delete(QAChecklistItem, { releaseId: id });

        // Create new checklist items
        const checklistItems = updateQAReleaseDto.checklistItems.map(item => {
          return queryRunner.manager.create(QAChecklistItem, {
            releaseId: id,
            item: item.item,
            checked: item.checked,
            remarks: item.remarks,
          });
        });

        await queryRunner.manager.save(QAChecklistItem, checklistItems);
      }

      await queryRunner.commitTransaction();

      // Reload with checklist items
      const updatedRelease = await this.qaReleasesRepository.findOne({
        where: { id },
        relations: ['checklistItems'],
      });

      return this.toResponseDto(updatedRelease!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completeChecklist(id: number, reviewedBy: number): Promise<QAReleaseResponseDto> {
    const release = await this.qaReleasesRepository.findOne({
      where: { id },
      relations: ['checklistItems'],
    });

    if (!release) {
      throw new NotFoundException('QA release not found');
    }

    if (release.status !== QAReleaseStatus.PENDING) {
      throw new BadRequestException('Checklist can only be completed when status is Pending');
    }

    // Verify all checklist items are checked
    const uncheckedItems = release.checklistItems?.filter(item => !item.checked);
    if (uncheckedItems && uncheckedItems.length > 0) {
      throw new BadRequestException('All checklist items must be checked before completing checklist');
    }

    release.status = QAReleaseStatus.UNDER_REVIEW;
    release.reviewedBy = reviewedBy;
    release.reviewedAt = new Date();

    const updated = await this.qaReleasesRepository.save(release);
    return this.toResponseDto(updated);
  }

  async makeDecision(id: number, makeDecisionDto: MakeReleaseDecisionDto): Promise<QAReleaseResponseDto> {
    const release = await this.qaReleasesRepository.findOne({
      where: { id },
      relations: ['checklistItems'],
    });

    if (!release) {
      throw new NotFoundException('QA release not found');
    }

    if (release.status !== QAReleaseStatus.UNDER_REVIEW && release.status !== QAReleaseStatus.CHECKLIST_IN_PROGRESS) {
      throw new BadRequestException('Decision can only be made when status is Under Review or Checklist In Progress');
    }

    release.decision = makeDecisionDto.decision;
    release.decisionReason = makeDecisionDto.reason;
    release.decidedBy = makeDecisionDto.decidedBy;
    release.decidedAt = new Date();
    release.eSignature = makeDecisionDto.eSignature;

    if (makeDecisionDto.remarks) {
      release.remarks = release.remarks 
        ? `${release.remarks}\n\nDecision: ${makeDecisionDto.remarks}`
        : makeDecisionDto.remarks;
    }

    if (makeDecisionDto.decision === QADecision.RELEASE) {
      release.status = QAReleaseStatus.RELEASED;
    } else if (makeDecisionDto.decision === QADecision.HOLD) {
      release.status = QAReleaseStatus.HELD;
    } else if (makeDecisionDto.decision === QADecision.REJECT) {
      release.status = QAReleaseStatus.REJECTED;
    }

    const updated = await this.qaReleasesRepository.save(release);

    // If released, notify warehouse
    if (makeDecisionDto.decision === QADecision.RELEASE) {
      await this.notifyWarehouse(id);
    }

    return this.toResponseDto(updated);
  }

  async notifyWarehouse(id: number): Promise<QAReleaseResponseDto> {
    const release = await this.qaReleasesRepository.findOne({
      where: { id },
      relations: ['checklistItems'],
    });

    if (!release) {
      throw new NotFoundException('QA release not found');
    }

    if (release.status !== QAReleaseStatus.RELEASED) {
      throw new BadRequestException('Can only notify warehouse for released materials');
    }

    if (release.warehouseNotified) {
      throw new BadRequestException('Warehouse has already been notified');
    }

    // Here you would typically send a message to a warehouse service
    // For now, we'll just mark it as notified
    release.warehouseNotified = true;
    release.warehouseNotifiedAt = new Date();

    const updated = await this.qaReleasesRepository.save(release);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const release = await this.qaReleasesRepository.findOne({ where: { id } });
    if (!release) {
      throw new NotFoundException('QA release not found');
    }
    if (release.status === QAReleaseStatus.RELEASED) {
      throw new BadRequestException('Cannot delete released QA release');
    }
    await this.qaReleasesRepository.remove(release);
  }

  private async toResponseDto(release: QARelease): Promise<QAReleaseResponseDto> {
    return {
      id: release.id,
      releaseNumber: release.releaseNumber,
      sampleId: release.sampleId,
      goodsReceiptItemId: release.goodsReceiptItemId,
      materialId: release.materialId,
      materialName: release.materialName,
      materialCode: release.materialCode,
      batchNumber: release.batchNumber,
      quantity: Number(release.quantity),
      unit: release.unit,
      status: release.status,
      decision: release.decision,
      decisionReason: release.decisionReason,
      checklistItems: (release.checklistItems || []).map(item => ({
        id: item.id,
        item: item.item,
        checked: item.checked,
        remarks: item.remarks,
      })),
      qcResultIds: release.qcResultIds || [],
      submittedBy: release.submittedBy,
      submittedAt: release.submittedAt,
      reviewedBy: release.reviewedBy,
      reviewedAt: release.reviewedAt,
      decidedBy: release.decidedBy,
      decidedAt: release.decidedAt,
      eSignature: release.eSignature,
      remarks: release.remarks,
      warehouseNotified: release.warehouseNotified,
      warehouseNotifiedAt: release.warehouseNotifiedAt,
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
    };
  }
}


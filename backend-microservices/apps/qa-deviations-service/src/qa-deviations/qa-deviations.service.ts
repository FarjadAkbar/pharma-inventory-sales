import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QADeviation } from '../entities/qa-deviation.entity';
import { 
  CreateQADeviationDto, 
  UpdateQADeviationDto,
  QADeviationResponseDto,
  DeviationStatus,
} from '@repo/shared';

@Injectable()
export class QADeviationsService {
  constructor(
    @InjectRepository(QADeviation)
    private qaDeviationsRepository: Repository<QADeviation>,
  ) {}

  async generateDeviationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DEV-${year}-`;
    
    const lastDeviation = await this.qaDeviationsRepository
      .createQueryBuilder('deviation')
      .where('deviation.deviationNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('deviation.deviationNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastDeviation) {
      const lastSequence = parseInt(lastDeviation.deviationNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async create(createQADeviationDto: CreateQADeviationDto): Promise<QADeviationResponseDto> {
    // Generate deviation number
    const deviationNumber = await this.generateDeviationNumber();

    // Create QA deviation
    const qaDeviation = this.qaDeviationsRepository.create({
      deviationNumber,
      title: createQADeviationDto.title,
      description: createQADeviationDto.description,
      severity: createQADeviationDto.severity,
      category: createQADeviationDto.category,
      status: DeviationStatus.OPEN,
      sourceType: createQADeviationDto.sourceType,
      sourceId: createQADeviationDto.sourceId,
      sourceReference: createQADeviationDto.sourceReference,
      materialId: createQADeviationDto.materialId,
      materialName: createQADeviationDto.materialName,
      batchNumber: createQADeviationDto.batchNumber,
      discoveredBy: createQADeviationDto.discoveredBy,
      discoveredAt: new Date(),
      assignedTo: createQADeviationDto.assignedTo,
      assignedAt: createQADeviationDto.assignedTo ? new Date() : undefined,
      dueDate: createQADeviationDto.dueDate ? new Date(createQADeviationDto.dueDate) : undefined,
      rootCause: createQADeviationDto.rootCause,
      immediateAction: createQADeviationDto.immediateAction,
      correctiveAction: createQADeviationDto.correctiveAction,
      preventiveAction: createQADeviationDto.preventiveAction,
    });

    const saved = await this.qaDeviationsRepository.save(qaDeviation);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<QADeviationResponseDto[]> {
    const deviations = await this.qaDeviationsRepository.find({
      order: { createdAt: 'DESC' },
    });
    return Promise.all(deviations.map(deviation => this.toResponseDto(deviation)));
  }

  async findOne(id: number): Promise<QADeviationResponseDto> {
    const deviation = await this.qaDeviationsRepository.findOne({ where: { id } });
    if (!deviation) {
      throw new NotFoundException('QA deviation not found');
    }
    return this.toResponseDto(deviation);
  }

  async findBySource(sourceType: string, sourceId: number): Promise<QADeviationResponseDto[]> {
    const deviations = await this.qaDeviationsRepository.find({
      where: { sourceType: sourceType as any, sourceId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(deviations.map(deviation => this.toResponseDto(deviation)));
  }

  async update(id: number, updateQADeviationDto: UpdateQADeviationDto): Promise<QADeviationResponseDto> {
    const deviation = await this.qaDeviationsRepository.findOne({ where: { id } });
    if (!deviation) {
      throw new NotFoundException('QA deviation not found');
    }

    if (updateQADeviationDto.status) {
      deviation.status = updateQADeviationDto.status;
      if (updateQADeviationDto.status === DeviationStatus.CLOSED) {
        deviation.closedAt = new Date();
      }
    }
    if (updateQADeviationDto.title) {
      deviation.title = updateQADeviationDto.title;
    }
    if (updateQADeviationDto.description) {
      deviation.description = updateQADeviationDto.description;
    }
    if (updateQADeviationDto.severity) {
      deviation.severity = updateQADeviationDto.severity;
    }
    if (updateQADeviationDto.category) {
      deviation.category = updateQADeviationDto.category;
    }
    if (updateQADeviationDto.assignedTo !== undefined) {
      deviation.assignedTo = updateQADeviationDto.assignedTo;
      deviation.assignedAt = updateQADeviationDto.assignedTo ? new Date() : undefined;
    }
    if (updateQADeviationDto.dueDate) {
      deviation.dueDate = new Date(updateQADeviationDto.dueDate);
    }
    if (updateQADeviationDto.rootCause !== undefined) {
      deviation.rootCause = updateQADeviationDto.rootCause;
    }
    if (updateQADeviationDto.immediateAction !== undefined) {
      deviation.immediateAction = updateQADeviationDto.immediateAction;
    }
    if (updateQADeviationDto.correctiveAction !== undefined) {
      deviation.correctiveAction = updateQADeviationDto.correctiveAction;
    }
    if (updateQADeviationDto.preventiveAction !== undefined) {
      deviation.preventiveAction = updateQADeviationDto.preventiveAction;
    }
    if (updateQADeviationDto.effectivenessCheck !== undefined) {
      deviation.effectivenessCheck = updateQADeviationDto.effectivenessCheck;
    }

    const updated = await this.qaDeviationsRepository.save(deviation);
    return this.toResponseDto(updated);
  }

  async assign(id: number, assignedTo: number): Promise<QADeviationResponseDto> {
    const deviation = await this.qaDeviationsRepository.findOne({ where: { id } });
    if (!deviation) {
      throw new NotFoundException('QA deviation not found');
    }

    deviation.assignedTo = assignedTo;
    deviation.assignedAt = new Date();

    const updated = await this.qaDeviationsRepository.save(deviation);
    return this.toResponseDto(updated);
  }

  async updateStatus(id: number, status: DeviationStatus): Promise<QADeviationResponseDto> {
    const deviation = await this.qaDeviationsRepository.findOne({ where: { id } });
    if (!deviation) {
      throw new NotFoundException('QA deviation not found');
    }

    deviation.status = status;
    if (status === DeviationStatus.CLOSED) {
      deviation.closedAt = new Date();
    }

    const updated = await this.qaDeviationsRepository.save(deviation);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const deviation = await this.qaDeviationsRepository.findOne({ where: { id } });
    if (!deviation) {
      throw new NotFoundException('QA deviation not found');
    }
    await this.qaDeviationsRepository.remove(deviation);
  }

  private async toResponseDto(deviation: QADeviation): Promise<QADeviationResponseDto> {
    return {
      id: deviation.id,
      deviationNumber: deviation.deviationNumber,
      title: deviation.title,
      description: deviation.description,
      severity: deviation.severity,
      category: deviation.category,
      status: deviation.status,
      sourceType: deviation.sourceType,
      sourceId: deviation.sourceId,
      sourceReference: deviation.sourceReference,
      materialId: deviation.materialId,
      materialName: deviation.materialName,
      batchNumber: deviation.batchNumber,
      discoveredBy: deviation.discoveredBy,
      discoveredAt: deviation.discoveredAt,
      assignedTo: deviation.assignedTo,
      assignedAt: deviation.assignedAt,
      dueDate: deviation.dueDate,
      closedAt: deviation.closedAt,
      rootCause: deviation.rootCause,
      immediateAction: deviation.immediateAction,
      correctiveAction: deviation.correctiveAction,
      preventiveAction: deviation.preventiveAction,
      effectivenessCheck: deviation.effectivenessCheck,
      createdAt: deviation.createdAt,
      updatedAt: deviation.updatedAt,
    };
  }
}


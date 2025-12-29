import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchStep } from '../entities/batch-step.entity';
import { Batch } from '../entities/batch.entity';
import {
  ExecuteBatchStepDto,
  BatchStepResponseDto,
  BatchStepStatus,
} from '@repo/shared';

@Injectable()
export class BatchStepsService {
  constructor(
    @InjectRepository(BatchStep)
    private batchStepsRepository: Repository<BatchStep>,
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
  ) {}

  async create(batchId: number, createDto: ExecuteBatchStepDto): Promise<BatchStepResponseDto> {
    // Verify batch exists
    const batch = await this.batchesRepository.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    // Check if step already exists
    const existingStep = await this.batchStepsRepository.findOne({
      where: { batchId, stepNumber: createDto.stepNumber },
    });

    if (existingStep) {
      throw new BadRequestException(`Step ${createDto.stepNumber} already exists for this batch`);
    }

    const batchStep = this.batchStepsRepository.create({
      batchId,
      stepNumber: createDto.stepNumber,
      stepName: createDto.stepName,
      instruction: createDto.instruction,
      description: createDto.description,
      parameters: createDto.parameters,
      status: createDto.status || BatchStepStatus.PENDING,
      eSignature: createDto.eSignature,
      remarks: createDto.remarks,
      attachments: createDto.attachments,
    });

    const saved = await this.batchStepsRepository.save(batchStep);
    return this.toResponseDto(saved);
  }

  async execute(batchId: number, stepId: number, executeDto: ExecuteBatchStepDto): Promise<BatchStepResponseDto> {
    const batchStep = await this.batchStepsRepository.findOne({
      where: { id: stepId, batchId },
    });

    if (!batchStep) {
      throw new NotFoundException(`Batch step with ID ${stepId} not found for batch ${batchId}`);
    }

    // Validate step sequence - previous steps should be completed
    if (batchStep.stepNumber > 1) {
      const previousSteps = await this.batchStepsRepository.find({
        where: { batchId, stepNumber: batchStep.stepNumber - 1 },
      });

      const incompletePrevious = previousSteps.find(step => step.status !== BatchStepStatus.COMPLETED);
      if (incompletePrevious) {
        throw new BadRequestException(`Previous step ${incompletePrevious.stepNumber} must be completed first`);
      }
    }

    batchStep.status = executeDto.status || BatchStepStatus.COMPLETED;
    batchStep.performedBy = executeDto.performedBy;
    batchStep.performedAt = new Date();
    batchStep.eSignature = executeDto.eSignature;
    batchStep.parameters = executeDto.parameters || batchStep.parameters;
    batchStep.remarks = executeDto.remarks;

    if (executeDto.attachments) {
      batchStep.attachments = executeDto.attachments;
    }

    const updated = await this.batchStepsRepository.save(batchStep);
    return this.toResponseDto(updated);
  }

  async findAll(batchId: number): Promise<BatchStepResponseDto[]> {
    const steps = await this.batchStepsRepository.find({
      where: { batchId },
      order: { stepNumber: 'ASC' },
    });
    return steps.map(step => this.toResponseDto(step));
  }

  async findOne(id: number): Promise<BatchStepResponseDto> {
    const step = await this.batchStepsRepository.findOne({ where: { id } });
    if (!step) {
      throw new NotFoundException(`Batch step with ID ${id} not found`);
    }
    return this.toResponseDto(step);
  }

  async update(id: number, updateDto: Partial<ExecuteBatchStepDto>): Promise<BatchStepResponseDto> {
    const step = await this.batchStepsRepository.findOne({ where: { id } });
    if (!step) {
      throw new NotFoundException(`Batch step with ID ${id} not found`);
    }

    Object.assign(step, updateDto);
    const updated = await this.batchStepsRepository.save(step);
    return this.toResponseDto(updated);
  }

  private toResponseDto(step: BatchStep): BatchStepResponseDto {
    return {
      id: step.id,
      batchId: step.batchId,
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      instruction: step.instruction,
      description: step.description,
      parameters: step.parameters,
      status: step.status,
      performedBy: step.performedBy,
      performedByName: undefined, // Would be populated from user service
      performedAt: step.performedAt,
      eSignature: step.eSignature,
      remarks: step.remarks,
      attachments: step.attachments,
      createdAt: step.createdAt,
      updatedAt: step.updatedAt,
    };
  }
}


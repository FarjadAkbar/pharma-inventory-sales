import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from '../entities/batch.entity';
import { BatchStep } from '../entities/batch-step.entity';
import { MaterialConsumption } from '../entities/material-consumption.entity';
import { BatchStatus, BatchStepStatus } from '@repo/shared';

export interface EBRResponseDto {
  batchId: number;
  batchNumber: string;
  drugId: number;
  drugName: string;
  drugCode: string;
  siteId: number;
  siteName: string;
  bomVersion: number;
  plannedQuantity: number;
  actualQuantity?: number;
  unit: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  steps: {
    stepNumber: number;
    stepName: string;
    instruction: string;
    description?: string;
    parameters?: Record<string, any>;
    performedBy?: number;
    performedByName?: string;
    performedAt?: Date;
    eSignature?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    remarks?: string;
    attachments?: string[];
  }[];
  materialConsumptions: {
    id: number;
    materialId: number;
    materialName: string;
    materialCode: string;
    batchNumber: string;
    plannedQuantity: number;
    actualQuantity: number;
    unit: string;
    status: string;
    consumedAt: Date;
    consumedBy: number;
    consumedByName?: string;
  }[];
  startDate: Date;
  endDate?: Date;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  progress: number;
}

@Injectable()
export class EBRService {
  constructor(
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
    @InjectRepository(BatchStep)
    private batchStepsRepository: Repository<BatchStep>,
    @InjectRepository(MaterialConsumption)
    private materialConsumptionRepository: Repository<MaterialConsumption>,
  ) {}

  async getEBRByBatchId(batchId: number): Promise<EBRResponseDto> {
    const batch = await this.batchesRepository.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const [steps, consumptions] = await Promise.all([
      this.batchStepsRepository.find({
        where: { batchId },
        order: { stepNumber: 'ASC' },
      }),
      this.materialConsumptionRepository.find({
        where: { batchId },
        order: { consumedAt: 'DESC' },
      }),
    ]);

    const completedSteps = steps.filter(s => s.status === BatchStepStatus.COMPLETED).length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Map batch status to EBR status
    let ebrStatus: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected';
    switch (batch.status) {
      case BatchStatus.DRAFT:
      case BatchStatus.PLANNED:
        ebrStatus = 'draft';
        break;
      case BatchStatus.IN_PROGRESS:
        ebrStatus = 'in_progress';
        break;
      case BatchStatus.COMPLETED:
        ebrStatus = 'completed';
        break;
      case BatchStatus.QC_PENDING:
        ebrStatus = 'completed'; // Completed but pending QC
        break;
      case BatchStatus.CANCELLED:
      case BatchStatus.FAILED:
        ebrStatus = 'rejected';
        break;
      default:
        ebrStatus = 'draft';
    }

    return {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      drugId: batch.drugId,
      drugName: batch.drugName,
      drugCode: batch.drugCode,
      siteId: batch.siteId,
      siteName: batch.siteName,
      bomVersion: batch.bomVersion,
      plannedQuantity: Number(batch.plannedQuantity),
      actualQuantity: batch.actualQuantity ? Number(batch.actualQuantity) : undefined,
      unit: batch.unit,
      status: ebrStatus,
      steps: steps.map(step => ({
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        instruction: step.instruction,
        description: step.description,
        parameters: step.parameters,
        performedBy: step.performedBy,
        performedByName: undefined, // Would be populated from user service
        performedAt: step.performedAt,
        eSignature: step.eSignature,
        status: this.mapStepStatus(step.status),
        remarks: step.remarks,
        attachments: step.attachments,
      })),
      materialConsumptions: consumptions.map(consumption => ({
        id: consumption.id,
        materialId: consumption.materialId,
        materialName: consumption.materialName,
        materialCode: consumption.materialCode,
        batchNumber: consumption.batchNumber,
        plannedQuantity: Number(consumption.plannedQuantity),
        actualQuantity: Number(consumption.actualQuantity),
        unit: consumption.unit,
        status: consumption.status,
        consumedAt: consumption.consumedAt,
        consumedBy: consumption.consumedBy,
        consumedByName: undefined, // Would be populated from user service
      })),
      startDate: batch.actualStartDate || batch.plannedStartDate,
      endDate: batch.actualEndDate,
      approvedBy: undefined, // Would be populated from QC/QA service
      approvedByName: undefined,
      approvedAt: undefined,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
      progress,
    };
  }

  async getEBRs(params?: {
    batchId?: number;
    drugId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ ebrs: EBRResponseDto[]; pagination: { page: number; pages: number; total: number } }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.batchId) where.id = params.batchId;
    if (params?.drugId) where.drugId = params.drugId;
    if (params?.status) {
      // Map EBR status to batch status
      switch (params.status) {
        case 'draft':
          where.status = BatchStatus.DRAFT;
          break;
        case 'in_progress':
          where.status = BatchStatus.IN_PROGRESS;
          break;
        case 'completed':
          where.status = BatchStatus.COMPLETED;
          break;
        case 'rejected':
          where.status = BatchStatus.CANCELLED;
          break;
      }
    }

    const [batches, total] = await this.batchesRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const ebrs = await Promise.all(
      batches.map(batch => this.getEBRByBatchId(batch.id))
    );

    return {
      ebrs,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  private mapStepStatus(status: BatchStepStatus): 'pending' | 'in_progress' | 'completed' | 'skipped' {
    switch (status) {
      case BatchStepStatus.PENDING:
        return 'pending';
      case BatchStepStatus.IN_PROGRESS:
        return 'in_progress';
      case BatchStepStatus.COMPLETED:
        return 'completed';
      case BatchStepStatus.SKIPPED:
        return 'skipped';
      case BatchStepStatus.FAILED:
        return 'pending'; // Treat failed as pending for retry
      default:
        return 'pending';
    }
  }
}


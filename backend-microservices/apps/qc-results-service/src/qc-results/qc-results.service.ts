import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { QCResult } from '../entities/qc-result.entity';
import { 
  CreateQCResultDto, 
  UpdateQCResultDto,
  QCResultResponseDto,
  QCResultStatus,
  QC_SAMPLE_PATTERNS,
  QCSampleResponseDto,
  QCSampleStatus,
  QC_TEST_PATTERNS,
  QCTestResponseDto,
  SubmitResultsToQADto,
} from '@repo/shared';

@Injectable()
export class QCResultsService {
  constructor(
    @InjectRepository(QCResult)
    private qcResultsRepository: Repository<QCResult>,
    @Inject('QC_SAMPLE_SERVICE')
    private qcSampleClient: ClientProxy,
    @Inject('QC_TEST_SERVICE')
    private qcTestClient: ClientProxy,
  ) {}

  async create(createQCResultDto: CreateQCResultDto): Promise<QCResultResponseDto> {
    // Verify sample exists
    let sample: QCSampleResponseDto | null = null;
    try {
      sample = await firstValueFrom(
        this.qcSampleClient.send<QCSampleResponseDto>(QC_SAMPLE_PATTERNS.GET_BY_ID, createQCResultDto.sampleId)
      );
    } catch (error) {
      throw new NotFoundException('QC sample not found');
    }

    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }

    // Verify test exists
    let test: QCTestResponseDto | null = null;
    try {
      test = await firstValueFrom(
        this.qcTestClient.send<QCTestResponseDto>(QC_TEST_PATTERNS.GET_BY_ID, createQCResultDto.testId)
      );
    } catch (error) {
      throw new NotFoundException('QC test not found');
    }

    if (!test) {
      throw new NotFoundException('QC test not found');
    }

    // Check if result already exists for this sample and test
    const existingResult = await this.qcResultsRepository.findOne({
      where: { sampleId: createQCResultDto.sampleId, testId: createQCResultDto.testId },
    });

    if (existingResult) {
      throw new BadRequestException('QC result already exists for this sample and test');
    }

    // Create QC result
    const qcResult = this.qcResultsRepository.create({
      sampleId: createQCResultDto.sampleId,
      testId: createQCResultDto.testId,
      resultValue: createQCResultDto.resultValue,
      unit: createQCResultDto.unit,
      passed: createQCResultDto.passed,
      status: QCResultStatus.IN_PROGRESS,
      remarks: createQCResultDto.remarks,
      performedBy: createQCResultDto.performedBy,
      performedAt: createQCResultDto.performedAt ? new Date(createQCResultDto.performedAt) : new Date(),
      submittedToQA: false,
    });

    const saved = await this.qcResultsRepository.save(qcResult);
    return this.toResponseDto(saved, test);
  }

  async findAll(): Promise<QCResultResponseDto[]> {
    const results = await this.qcResultsRepository.find({
      order: { createdAt: 'DESC' },
    });
    return Promise.all(results.map(result => this.toResponseDtoWithTest(result)));
  }

  async findOne(id: number): Promise<QCResultResponseDto> {
    const result = await this.qcResultsRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('QC result not found');
    }
    return this.toResponseDtoWithTest(result);
  }

  async findBySample(sampleId: number): Promise<QCResultResponseDto[]> {
    const results = await this.qcResultsRepository.find({
      where: { sampleId },
      order: { createdAt: 'ASC' },
    });
    return Promise.all(results.map(result => this.toResponseDtoWithTest(result)));
  }

  async update(id: number, updateQCResultDto: UpdateQCResultDto): Promise<QCResultResponseDto> {
    const result = await this.qcResultsRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('QC result not found');
    }

    if (result.submittedToQA) {
      throw new BadRequestException('Cannot update result that has been submitted to QA');
    }

    if (updateQCResultDto.resultValue) {
      result.resultValue = updateQCResultDto.resultValue;
    }
    if (updateQCResultDto.unit) {
      result.unit = updateQCResultDto.unit;
    }
    if (updateQCResultDto.passed !== undefined) {
      result.passed = updateQCResultDto.passed;
    }
    if (updateQCResultDto.status) {
      result.status = updateQCResultDto.status;
    }
    if (updateQCResultDto.remarks !== undefined) {
      result.remarks = updateQCResultDto.remarks;
    }

    // If status is completed, mark as completed
    if (updateQCResultDto.status === QCResultStatus.COMPLETED) {
      result.status = QCResultStatus.COMPLETED;
    }

    const updated = await this.qcResultsRepository.save(result);
    return this.toResponseDtoWithTest(updated);
  }

  async submitToQA(submitResultsDto: SubmitResultsToQADto): Promise<QCResultResponseDto[]> {
    // Verify sample exists
    let sample: QCSampleResponseDto | null = null;
    try {
      sample = await firstValueFrom(
        this.qcSampleClient.send<QCSampleResponseDto>(QC_SAMPLE_PATTERNS.GET_BY_ID, submitResultsDto.sampleId)
      );
    } catch (error) {
      throw new NotFoundException('QC sample not found');
    }

    if (!sample) {
      throw new NotFoundException('QC sample not found');
    }

    // Verify all results exist and belong to the sample
    const results: QCResult[] = [];
    for (const resultId of submitResultsDto.resultIds) {
      const result = await this.qcResultsRepository.findOne({
        where: { id: resultId, sampleId: submitResultsDto.sampleId },
      });
      if (!result) {
        throw new NotFoundException(`QC result ${resultId} not found for sample ${submitResultsDto.sampleId}`);
      }
      if (result.submittedToQA) {
        throw new BadRequestException(`QC result ${resultId} has already been submitted to QA`);
      }
      if (result.status !== QCResultStatus.COMPLETED) {
        throw new BadRequestException(`QC result ${resultId} must be completed before submitting to QA`);
      }
      results.push(result);
    }

    // Mark all results as submitted to QA
    const now = new Date();
    for (const result of results) {
      result.submittedToQA = true;
      result.submittedAt = now;
      if (result.remarks && submitResultsDto.remarks) {
        result.remarks = `${result.remarks}\n\nSubmitted to QA: ${submitResultsDto.remarks}`;
      } else if (submitResultsDto.remarks) {
        result.remarks = submitResultsDto.remarks;
      }
    }

    await this.qcResultsRepository.save(results);

    // Update sample status to "Submitted to QA"
    await firstValueFrom(
      this.qcSampleClient.send(QC_SAMPLE_PATTERNS.UPDATE, {
        id: submitResultsDto.sampleId,
        updateDto: { status: 'Submitted to QA' as any },
      })
    );

    return Promise.all(results.map(result => this.toResponseDtoWithTest(result)));
  }

  async completeTesting(sampleId: number): Promise<void> {
    // Verify all results for the sample are completed
    const results = await this.qcResultsRepository.find({
      where: { sampleId },
    });

    if (results.length === 0) {
      throw new BadRequestException('No QC results found for this sample');
    }

    const incompleteResults = results.filter(r => r.status !== QCResultStatus.COMPLETED);
    if (incompleteResults.length > 0) {
      throw new BadRequestException('All QC results must be completed before marking testing as complete');
    }

    // Update sample status to "QC Complete"
    await firstValueFrom(
      this.qcSampleClient.send(QC_SAMPLE_PATTERNS.UPDATE, {
        id: sampleId,
        updateDto: { status: QCSampleStatus.QC_COMPLETE },
      })
    );
  }

  async delete(id: number): Promise<void> {
    const result = await this.qcResultsRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('QC result not found');
    }
    if (result.submittedToQA) {
      throw new BadRequestException('Cannot delete result that has been submitted to QA');
    }
    await this.qcResultsRepository.remove(result);
  }

  private async toResponseDto(result: QCResult, test?: QCTestResponseDto): Promise<QCResultResponseDto> {
    return {
      id: result.id,
      sampleId: result.sampleId,
      testId: result.testId,
      testName: test?.name,
      testCode: test?.code,
      resultValue: result.resultValue,
      unit: result.unit,
      passed: result.passed,
      status: result.status,
      remarks: result.remarks,
      performedBy: result.performedBy,
      performedAt: result.performedAt,
      submittedToQA: result.submittedToQA,
      submittedAt: result.submittedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  private async toResponseDtoWithTest(result: QCResult): Promise<QCResultResponseDto> {
    let test: QCTestResponseDto | null = null;
    try {
      test = await firstValueFrom(
        this.qcTestClient.send<QCTestResponseDto>(QC_TEST_PATTERNS.GET_BY_ID, result.testId)
      );
    } catch (error) {
      console.warn(`QC test ${result.testId} not found for result ${result.id}`);
    }

    return this.toResponseDto(result, test || undefined);
  }
}


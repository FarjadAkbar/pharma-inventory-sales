import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QCTest } from '../entities/qc-test.entity';
import { QCTestSpecification } from '../entities/qc-test-specification.entity';
import { 
  CreateQCTestDto, 
  UpdateQCTestDto,
  QCTestResponseDto,
  QCTestStatus,
} from '@repo/shared';

@Injectable()
export class QCTestsService {
  constructor(
    @InjectRepository(QCTest)
    private qcTestsRepository: Repository<QCTest>,
    @InjectRepository(QCTestSpecification)
    private qcTestSpecificationsRepository: Repository<QCTestSpecification>,
    private dataSource: DataSource,
  ) {}

  async create(createQCTestDto: CreateQCTestDto): Promise<QCTestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create test
      const qcTest = this.qcTestsRepository.create({
        name: createQCTestDto.name,
        code: createQCTestDto.code,
        description: createQCTestDto.description,
        category: createQCTestDto.category,
        status: createQCTestDto.status || QCTestStatus.ACTIVE,
      });

      const savedTest = await queryRunner.manager.save(QCTest, qcTest);

      // Create specifications
      if (createQCTestDto.specifications && createQCTestDto.specifications.length > 0) {
        const specifications = createQCTestDto.specifications.map(spec => {
          return this.qcTestSpecificationsRepository.create({
            testId: savedTest.id,
            parameter: spec.parameter,
            minValue: spec.minValue,
            maxValue: spec.maxValue,
            targetValue: spec.targetValue,
            unit: spec.unit,
            method: spec.method,
          });
        });

        await queryRunner.manager.save(QCTestSpecification, specifications);
      }

      await queryRunner.commitTransaction();

      // Reload with specifications
      const testWithSpecs = await this.qcTestsRepository.findOne({
        where: { id: savedTest.id },
        relations: ['specifications'],
      });

      return this.toResponseDto(testWithSpecs!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<QCTestResponseDto[]> {
    const tests = await this.qcTestsRepository.find({
      relations: ['specifications'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(tests.map(test => this.toResponseDto(test)));
  }

  async findOne(id: number): Promise<QCTestResponseDto> {
    const test = await this.qcTestsRepository.findOne({
      where: { id },
      relations: ['specifications'],
    });
    if (!test) {
      throw new NotFoundException('QC test not found');
    }
    return this.toResponseDto(test);
  }

  async findByMaterial(materialId: number): Promise<QCTestResponseDto[]> {
    // This would typically query a material-test mapping table
    // For now, return all active tests
    const tests = await this.qcTestsRepository.find({
      where: { status: QCTestStatus.ACTIVE },
      relations: ['specifications'],
      order: { name: 'ASC' },
    });
    return Promise.all(tests.map(test => this.toResponseDto(test)));
  }

  async update(id: number, updateQCTestDto: UpdateQCTestDto): Promise<QCTestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const test = await this.qcTestsRepository.findOne({
      where: { id },
      relations: ['specifications'],
    });

    if (!test) {
      throw new NotFoundException('QC test not found');
    }

    try {
      // Update test fields
      if (updateQCTestDto.name) test.name = updateQCTestDto.name;
      if (updateQCTestDto.code !== undefined) test.code = updateQCTestDto.code;
      if (updateQCTestDto.description !== undefined) test.description = updateQCTestDto.description;
      if (updateQCTestDto.category !== undefined) test.category = updateQCTestDto.category;
      if (updateQCTestDto.status) test.status = updateQCTestDto.status;

      await queryRunner.manager.save(QCTest, test);

      // Update specifications if provided
      if (updateQCTestDto.specifications) {
        // Delete existing specifications
        await queryRunner.manager.delete(QCTestSpecification, { testId: id });

        // Create new specifications
        const specifications = updateQCTestDto.specifications.map(spec => {
          return queryRunner.manager.create(QCTestSpecification, {
            testId: id,
            parameter: spec.parameter,
            minValue: spec.minValue,
            maxValue: spec.maxValue,
            targetValue: spec.targetValue,
            unit: spec.unit,
            method: spec.method,
          });
        });

        await queryRunner.manager.save(QCTestSpecification, specifications);
      }

      await queryRunner.commitTransaction();

      // Reload with specifications
      const updatedTest = await this.qcTestsRepository.findOne({
        where: { id },
        relations: ['specifications'],
      });

      return this.toResponseDto(updatedTest!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<void> {
    const test = await this.qcTestsRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException('QC test not found');
    }
    await this.qcTestsRepository.remove(test);
  }

  private async toResponseDto(test: QCTest): Promise<QCTestResponseDto> {
    return {
      id: test.id,
      name: test.name,
      code: test.code,
      description: test.description,
      category: test.category,
      specifications: (test.specifications || []).map(spec => ({
        id: spec.id,
        parameter: spec.parameter,
        minValue: spec.minValue,
        maxValue: spec.maxValue,
        targetValue: spec.targetValue,
        unit: spec.unit,
        method: spec.method,
      })),
      status: test.status,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };
  }
}


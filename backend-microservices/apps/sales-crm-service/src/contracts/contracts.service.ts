import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Contract } from '../entities/contract.entity';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractResponseDto,
  ContractType,
  ContractStatus,
} from '@repo/shared';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  async create(createDto: CreateContractDto): Promise<ContractResponseDto> {
    const contractNumber = await this.generateContractNumber();

    const contract = this.contractRepository.create({
      contractNumber,
      ...createDto,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
      renewalDate: createDto.renewalDate ? new Date(createDto.renewalDate) : undefined,
      signedDate: createDto.signedDate ? new Date(createDto.signedDate) : undefined,
      status: createDto.status || ContractStatus.DRAFT,
      autoRenewal: createDto.autoRenewal || false,
    });

    const saved = await this.contractRepository.save(contract);
    return this.toResponseDto(saved);
  }

  async findAll(params?: {
    search?: string;
    accountId?: number;
    type?: ContractType;
    status?: ContractStatus;
    page?: number;
    limit?: number;
  }): Promise<{ contracts: ContractResponseDto[]; pagination: any }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Contract> = {};

    if (params?.accountId) {
      where.accountId = params.accountId;
    }

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.status) {
      where.status = params.status;
    }

    const queryBuilder = this.contractRepository.createQueryBuilder('contract');

    if (params?.search) {
      queryBuilder.where(
        '(contract.title ILIKE :search OR contract.contractNumber ILIKE :search OR contract.accountName ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    if (where.accountId) {
      queryBuilder.andWhere('contract.accountId = :accountId', { accountId: where.accountId });
    }

    if (where.type) {
      queryBuilder.andWhere('contract.type = :type', { type: where.type });
    }

    if (where.status) {
      queryBuilder.andWhere('contract.status = :status', { status: where.status });
    }

    const [contracts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('contract.createdAt', 'DESC')
      .getManyAndCount();

    return {
      contracts: contracts.map(contract => this.toResponseDto(contract)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async findOne(id: number): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOne({ where: { id } });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return this.toResponseDto(contract);
  }

  async update(id: number, updateDto: UpdateContractDto): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOne({ where: { id } });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    if (updateDto.startDate) {
      updateDto.startDate = new Date(updateDto.startDate).toISOString();
    }
    if (updateDto.endDate) {
      updateDto.endDate = new Date(updateDto.endDate).toISOString();
    }
    if (updateDto.renewalDate) {
      updateDto.renewalDate = new Date(updateDto.renewalDate).toISOString();
    }
    if (updateDto.signedDate) {
      updateDto.signedDate = new Date(updateDto.signedDate).toISOString();
    }

    Object.assign(contract, {
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : contract.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : contract.endDate,
      renewalDate: updateDto.renewalDate ? new Date(updateDto.renewalDate) : contract.renewalDate,
      signedDate: updateDto.signedDate ? new Date(updateDto.signedDate) : contract.signedDate,
    });

    const updated = await this.contractRepository.save(contract);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const contract = await this.contractRepository.findOne({ where: { id } });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    await this.contractRepository.remove(contract);
  }

  async renew(id: number, renewalData: { renewalDate: string; endDate: string; renewedBy: number }): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOne({ where: { id } });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    contract.status = ContractStatus.RENEWED;
    contract.renewalDate = new Date(renewalData.renewalDate);
    contract.endDate = new Date(renewalData.endDate);

    const updated = await this.contractRepository.save(contract);
    return this.toResponseDto(updated);
  }

  async terminate(id: number, terminationData: { terminatedBy: number; reason?: string }): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOne({ where: { id } });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    contract.status = ContractStatus.TERMINATED;

    const updated = await this.contractRepository.save(contract);
    return this.toResponseDto(updated);
  }

  private async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.contractRepository.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `CNT-${year}-${sequence}`;
  }

  private toResponseDto(contract: Contract): ContractResponseDto {
    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      title: contract.title,
      accountId: contract.accountId,
      accountName: contract.accountName,
      type: contract.type,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      renewalDate: contract.renewalDate,
      value: Number(contract.value),
      currency: contract.currency,
      paymentTerms: contract.paymentTerms,
      contractManager: contract.contractManager,
      contractManagerName: contract.contractManagerName,
      signedBy: contract.signedBy,
      signedByName: contract.signedByName,
      signedDate: contract.signedDate,
      autoRenewal: contract.autoRenewal,
      terms: contract.terms,
      specialConditions: contract.specialConditions,
      documentUrl: contract.documentUrl,
      createdBy: contract.createdBy,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }
}

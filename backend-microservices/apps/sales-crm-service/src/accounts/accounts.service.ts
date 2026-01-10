import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Account } from '../entities/account.entity';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountResponseDto,
  AccountType,
  AccountStatus,
} from '@repo/shared';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(createDto: CreateAccountDto): Promise<AccountResponseDto> {
    const accountNumber = await this.generateAccountNumber();

    const account = this.accountRepository.create({
      accountNumber,
      ...createDto,
      status: createDto.status || AccountStatus.ACTIVE,
    });

    const saved = await this.accountRepository.save(account);
    return this.toResponseDto(saved);
  }

  async findAll(params?: {
    search?: string;
    type?: AccountType;
    status?: AccountStatus;
    page?: number;
    limit?: number;
  }): Promise<{ accounts: AccountResponseDto[]; pagination: any }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Account> = {};

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.status) {
      where.status = params.status;
    }

    const queryBuilder = this.accountRepository.createQueryBuilder('account');

    if (params?.search) {
      queryBuilder.where(
        '(account.accountName ILIKE :search OR account.accountCode ILIKE :search OR account.accountNumber ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    if (where.type) {
      queryBuilder.andWhere('account.type = :type', { type: where.type });
    }

    if (where.status) {
      queryBuilder.andWhere('account.status = :status', { status: where.status });
    }

    const [accounts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('account.createdAt', 'DESC')
      .getManyAndCount();

    return {
      accounts: accounts.map(acc => this.toResponseDto(acc)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async findOne(id: number): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return this.toResponseDto(account);
  }

  async update(id: number, updateDto: UpdateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    Object.assign(account, updateDto);
    const updated = await this.accountRepository.save(account);

    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    await this.accountRepository.remove(account);
  }

  private async generateAccountNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.accountRepository.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `ACC-${year}-${sequence}`;
  }

  private toResponseDto(account: Account): AccountResponseDto {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountCode: account.accountCode,
      type: account.type,
      status: account.status,
      phone: account.phone,
      email: account.email,
      billingAddress: account.billingAddress,
      shippingAddress: account.shippingAddress,
      creditLimit: account.creditLimit ? Number(account.creditLimit) : undefined,
      paymentTerms: account.paymentTerms,
      assignedSalesRep: account.assignedSalesRep,
      assignedSalesRepName: account.assignedSalesRepName,
      taxId: account.taxId,
      registrationNumber: account.registrationNumber,
      notes: account.notes,
      tags: account.tags,
      createdBy: account.createdBy,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}

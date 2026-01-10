import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { POSTransaction } from '../entities/pos-transaction.entity';
import {
  CreatePOSTransactionDto,
  UpdatePOSTransactionDto,
  POSTransactionResponseDto,
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
} from '@repo/shared';

@Injectable()
export class POSService {
  constructor(
    @InjectRepository(POSTransaction)
    private posRepository: Repository<POSTransaction>,
  ) {}

  async create(createDto: CreatePOSTransactionDto): Promise<POSTransactionResponseDto> {
    const transactionNumber = await this.generateTransactionNumber();

    const transaction = this.posRepository.create({
      transactionNumber,
      ...createDto,
      transactionDate: createDto.transactionDate ? new Date(createDto.transactionDate) : new Date(),
      paymentStatus: createDto.paymentStatus || PaymentStatus.PENDING,
      status: createDto.status || TransactionStatus.DRAFT,
    });

    const saved = await this.posRepository.save(transaction);
    return this.toResponseDto(saved);
  }

  async findAll(params?: {
    search?: string;
    siteId?: number;
    cashierId?: number;
    customerId?: number;
    status?: TransactionStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: POSTransactionResponseDto[]; pagination: any }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<POSTransaction> = {};

    if (params?.siteId) {
      where.siteId = params.siteId;
    }

    if (params?.cashierId) {
      where.cashierId = params.cashierId;
    }

    if (params?.customerId) {
      where.customerId = params.customerId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.paymentStatus) {
      where.paymentStatus = params.paymentStatus;
    }

    if (params?.paymentMethod) {
      where.paymentMethod = params.paymentMethod;
    }

    const queryBuilder = this.posRepository.createQueryBuilder('pos');

    if (params?.search) {
      queryBuilder.where(
        '(pos.transactionNumber ILIKE :search OR pos.customerName ILIKE :search OR pos.terminalName ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    if (where.siteId) {
      queryBuilder.andWhere('pos.siteId = :siteId', { siteId: where.siteId });
    }

    if (where.cashierId) {
      queryBuilder.andWhere('pos.cashierId = :cashierId', { cashierId: where.cashierId });
    }

    if (where.customerId) {
      queryBuilder.andWhere('pos.customerId = :customerId', { customerId: where.customerId });
    }

    if (where.status) {
      queryBuilder.andWhere('pos.status = :status', { status: where.status });
    }

    if (where.paymentStatus) {
      queryBuilder.andWhere('pos.paymentStatus = :paymentStatus', { paymentStatus: where.paymentStatus });
    }

    if (where.paymentMethod) {
      queryBuilder.andWhere('pos.paymentMethod = :paymentMethod', { paymentMethod: where.paymentMethod });
    }

    const [transactions, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('pos.transactionDate', 'DESC')
      .getManyAndCount();

    return {
      transactions: transactions.map(t => this.toResponseDto(t)),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async findOne(id: number): Promise<POSTransactionResponseDto> {
    const transaction = await this.posRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`POS Transaction with ID ${id} not found`);
    }

    return this.toResponseDto(transaction);
  }

  async update(id: number, updateDto: UpdatePOSTransactionDto): Promise<POSTransactionResponseDto> {
    const transaction = await this.posRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`POS Transaction with ID ${id} not found`);
    }

    Object.assign(transaction, {
      ...updateDto,
      transactionDate: updateDto.transactionDate ? new Date(updateDto.transactionDate) : transaction.transactionDate,
    });

    const updated = await this.posRepository.save(transaction);
    return this.toResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const transaction = await this.posRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`POS Transaction with ID ${id} not found`);
    }

    await this.posRepository.remove(transaction);
  }

  async voidTransaction(id: number, voidedBy: number): Promise<POSTransactionResponseDto> {
    const transaction = await this.posRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`POS Transaction with ID ${id} not found`);
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      transaction.status = TransactionStatus.VOIDED;
      transaction.paymentStatus = PaymentStatus.REFUNDED;
    } else {
      transaction.status = TransactionStatus.VOIDED;
    }

    const updated = await this.posRepository.save(transaction);
    return this.toResponseDto(updated);
  }

  async refundTransaction(id: number, refundData: { refundedBy: number; amount?: number; reason?: string }): Promise<POSTransactionResponseDto> {
    const transaction = await this.posRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`POS Transaction with ID ${id} not found`);
    }

    transaction.paymentStatus = PaymentStatus.REFUNDED;
    transaction.status = TransactionStatus.VOIDED;

    const updated = await this.posRepository.save(transaction);
    return this.toResponseDto(updated);
  }

  private async generateTransactionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const count = await this.posRepository.count({
      where: {
        transactionDate: new Date(new Date().setHours(0, 0, 0, 0)),
      } as any,
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `POS-${year}${month}${day}-${sequence}`;
  }

  private toResponseDto(transaction: POSTransaction): POSTransactionResponseDto {
    return {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      terminalId: transaction.terminalId,
      terminalName: transaction.terminalName,
      siteId: transaction.siteId,
      siteName: transaction.siteName,
      cashierId: transaction.cashierId,
      cashierName: transaction.cashierName,
      customerId: transaction.customerId,
      customerName: transaction.customerName,
      items: transaction.items,
      subtotal: Number(transaction.subtotal),
      tax: Number(transaction.tax),
      discount: Number(transaction.discount),
      total: Number(transaction.total),
      paymentMethod: transaction.paymentMethod,
      paymentStatus: transaction.paymentStatus,
      status: transaction.status,
      transactionDate: transaction.transactionDate,
      receiptNumber: transaction.receiptNumber,
      receiptUrl: transaction.receiptUrl,
      createdBy: transaction.createdBy,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}

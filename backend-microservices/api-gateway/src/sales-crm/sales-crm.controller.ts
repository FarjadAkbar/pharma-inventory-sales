import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountType,
  AccountStatus,
  ACCOUNT_PATTERNS,
  CreateContractDto,
  UpdateContractDto,
  ContractType,
  ContractStatus,
  CONTRACT_PATTERNS,
  CreatePOSTransactionDto,
  UpdatePOSTransactionDto,
  TransactionStatus,
  PaymentStatus,
  PaymentMethod,
  POS_PATTERNS,
} from '@repo/shared';

@Controller('sales-crm')
export class SalesCrmController {
  constructor(
    @Inject('SALES_CRM_SERVICE')
    private salesCrmClient: ClientProxy,
  ) {}

  // ========== Accounts ==========
  @Get('accounts')
  async getAccounts(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (type) params.type = type as AccountType;
    if (status) params.status = status as AccountStatus;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.LIST, params)
    );
    return { success: true, data: result };
  }

  @Get('accounts/search')
  async searchAccounts(
    @Query('search') search: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = { search };
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.SEARCH, params)
    );
    return { success: true, data: result };
  }

  @Get('accounts/:id')
  async getAccount(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Post('accounts')
  async createAccount(@Body() createDto: CreateAccountDto) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Put('accounts/:id')
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccountDto,
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.DELETE, id)
    );
    return { success: true, message: 'Account deleted successfully' };
  }

  // ========== Contracts ==========
  @Get('contracts')
  async getContracts(
    @Query('search') search?: string,
    @Query('accountId') accountId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (accountId) params.accountId = parseInt(accountId);
    if (type) params.type = type as ContractType;
    if (status) params.status = status as ContractStatus;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.LIST, params)
    );
    return { success: true, data: result };
  }

  @Get('contracts/:id')
  async getContract(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Post('contracts')
  async createContract(@Body() createDto: CreateContractDto) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Put('contracts/:id')
  async updateContract(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateContractDto,
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Delete('contracts/:id')
  async deleteContract(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.DELETE, id)
    );
    return { success: true, message: 'Contract deleted successfully' };
  }

  @Post('contracts/:id/renew')
  async renewContract(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { renewalDate: string; endDate: string; renewedBy: number },
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.RENEW, { id, ...body })
    );
    return { success: true, data: result };
  }

  @Post('contracts/:id/terminate')
  async terminateContract(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { terminatedBy: number; reason?: string },
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(CONTRACT_PATTERNS.TERMINATE, { id, ...body })
    );
    return { success: true, data: result };
  }

  // ========== POS Transactions ==========
  @Get('pos/transactions')
  async getPOSTransactions(
    @Query('search') search?: string,
    @Query('siteId') siteId?: string,
    @Query('cashierId') cashierId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (siteId) params.siteId = parseInt(siteId);
    if (cashierId) params.cashierId = parseInt(cashierId);
    if (customerId) params.customerId = parseInt(customerId);
    if (status) params.status = status as TransactionStatus;
    if (paymentStatus) params.paymentStatus = paymentStatus as PaymentStatus;
    if (paymentMethod) params.paymentMethod = paymentMethod as PaymentMethod;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.LIST, params)
    );
    return { success: true, data: result };
  }

  @Get('pos/transactions/:id')
  async getPOSTransaction(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Post('pos/transactions')
  async createPOSTransaction(@Body() createDto: CreatePOSTransactionDto) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Put('pos/transactions/:id')
  async updatePOSTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePOSTransactionDto,
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Delete('pos/transactions/:id')
  async deletePOSTransaction(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.DELETE, id)
    );
    return { success: true, message: 'POS Transaction deleted successfully' };
  }

  @Post('pos/transactions/:id/void')
  async voidTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { voidedBy: number },
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.VOID, { id, voidedBy: body.voidedBy })
    );
    return { success: true, data: result };
  }

  @Post('pos/transactions/:id/refund')
  async refundTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { refundedBy: number; amount?: number; reason?: string },
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(POS_PATTERNS.REFUND, { id, ...body })
    );
    return { success: true, data: result };
  }
}

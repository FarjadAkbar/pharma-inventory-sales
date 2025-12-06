import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  SUPPLIERS_CREATE,
  SUPPLIERS_DELETE,
  SUPPLIERS_GET_BY_ID,
  SUPPLIERS_LIST,
  SUPPLIERS_UPDATE
} from '@shared/constants/message-patterns';

import {
  ISupplierCreateAdapter,
  ISupplierDeleteAdapter,
  ISupplierGetByIdAdapter,
  ISupplierListAdapter,
  ISupplierUpdateAdapter,
  ISupplierUpdateRatingAdapter
} from './adapters';

@Controller()
export class SuppliersController {
  constructor(
    private readonly createUsecase: ISupplierCreateAdapter,
    private readonly updateUsecase: ISupplierUpdateAdapter,
    private readonly deleteUsecase: ISupplierDeleteAdapter,
    private readonly listUsecase: ISupplierListAdapter,
    private readonly getByIdUsecase: ISupplierGetByIdAdapter,
    private readonly updateRatingUsecase: ISupplierUpdateRatingAdapter
  ) {}

  @MessagePattern(SUPPLIERS_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(SUPPLIERS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(SUPPLIERS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(SUPPLIERS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(SUPPLIERS_UPDATE)
  async updateRating(@Payload() data: { id?: string; body?: unknown }) {
    return this.updateRatingUsecase.execute({ id: data.id, ...data.body } as any);
  }

  @MessagePattern(SUPPLIERS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}

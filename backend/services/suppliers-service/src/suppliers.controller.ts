import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  SUPPLIERS_CREATE,
  SUPPLIERS_DELETE,
  SUPPLIERS_GET_BY_ID,
  SUPPLIERS_LIST,
  SUPPLIERS_UPDATE
} from '@/constants/message-patterns';

import { SupplierCreateInput } from '@/core/supplier/use-cases/supplier-create';
import { SupplierUpdateInput } from '@/core/supplier/use-cases/supplier-update';
import { SupplierUpdateRatingInput } from '@/core/supplier/use-cases/supplier-update-rating';
import { SupplierDeleteInput } from '@/core/supplier/use-cases/supplier-delete';
import { SupplierGetByIdInput } from '@/core/supplier/use-cases/supplier-get-by-id';
import { SupplierListInput } from '@/core/supplier/repository/supplier';
import { ApiTrancingInput } from '@/utils/request';

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
  async create(@Payload() data: { body?: SupplierCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as SupplierCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(SUPPLIERS_UPDATE)
  async update(@Payload() data: { body?: Partial<SupplierUpdateInput> | Partial<SupplierUpdateRatingInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    
    // Check if this is a rating update (body only contains rating field)
    if (body.rating !== undefined && Object.keys(body).length === 1) {
      return this.updateRatingUsecase.execute({ id: data.id, rating: body.rating as number } as SupplierUpdateRatingInput);
    }
    
    // Regular update
    return this.updateUsecase.execute(
      { ...body, id: data.id } as SupplierUpdateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(SUPPLIERS_LIST)
  async list(@Payload() data: SupplierListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(SUPPLIERS_GET_BY_ID)
  async getById(@Payload() data: SupplierGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(SUPPLIERS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.deleteUsecase.execute(
      { id: data.id } as SupplierDeleteInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }
}

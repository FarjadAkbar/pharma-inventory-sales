import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  RAW_MATERIALS_CREATE,
  RAW_MATERIALS_DELETE,
  RAW_MATERIALS_GET_BY_ID,
  RAW_MATERIALS_LIST,
  RAW_MATERIALS_UPDATE
} from '@pharma/utils';

import { RawMaterialCreateInput } from '@pharma/core/raw-material/use-cases/raw-material-create';
import { RawMaterialDeleteInput } from '@pharma/core/raw-material/use-cases/raw-material-delete';
import { RawMaterialGetByIdInput } from '@pharma/core/raw-material/use-cases/raw-material-get-by-id';
import { RawMaterialListInput } from '@pharma/core/raw-material/repository/raw-material';
import { RawMaterialUpdateInput } from '@pharma/core/raw-material/use-cases/raw-material-update';
import { ApiTrancingInput } from '@pharma/utils/request';

import {
  IRawMaterialCreateAdapter,
  IRawMaterialDeleteAdapter,
  IRawMaterialGetByIdAdapter,
  IRawMaterialListAdapter,
  IRawMaterialUpdateAdapter
} from './adapters';

@Controller()
export class RawMaterialsController {
  constructor(
    private readonly createUsecase: IRawMaterialCreateAdapter,
    private readonly updateUsecase: IRawMaterialUpdateAdapter,
    private readonly deleteUsecase: IRawMaterialDeleteAdapter,
    private readonly listUsecase: IRawMaterialListAdapter,
    private readonly getByIdUsecase: IRawMaterialGetByIdAdapter
  ) {}

  @MessagePattern(RAW_MATERIALS_CREATE)
  async create(@Payload() data: { body?: RawMaterialCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as RawMaterialCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(RAW_MATERIALS_UPDATE)
  async update(@Payload() data: { body?: Partial<RawMaterialUpdateInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute(
      { ...body, id: data.id } as RawMaterialUpdateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(RAW_MATERIALS_LIST)
  async list(@Payload() data: RawMaterialListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(RAW_MATERIALS_GET_BY_ID)
  async getById(@Payload() data: RawMaterialGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(RAW_MATERIALS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.deleteUsecase.execute(
      { id: data.id } as RawMaterialDeleteInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }
}

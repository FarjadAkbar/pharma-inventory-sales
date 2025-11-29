import { ILoggerAdapter } from '@/infra/logger';
import { CreatedModel } from '@/infra/repository';
import { IEventAdapter } from '@/libs/event';
import { ValidateSchema } from '@/utils/decorators';
import { ApiConflictException, ApiNotFoundException, ApiBadRequestException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { UUIDUtils } from '@/utils/uuid';
import { Infer, InputValidator } from '@/utils/validator';
import { ISupplierRepository } from '@/core/supplier/repository/supplier';
import { IRawMaterialRepository } from '@/core/raw-material/repository/raw-material';

import { PurchaseOrderEntity, PurchaseOrderEntitySchema, PurchaseOrderStatusEnum, PurchaseOrderItemEntity, PurchaseOrderItemEntitySchema } from '../entity/purchase-order';
import { IPurchaseOrderRepository } from '../repository/purchase-order';

const POItemSchema = PurchaseOrderItemEntitySchema.pick({
  materialId: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true
});

export const PurchaseOrderCreateSchema = PurchaseOrderEntitySchema.pick({
  poNumber: true,
  supplierId: true,
  siteId: true,
  expectedDate: true
}).merge(
  InputValidator.object({
    items: InputValidator.array(POItemSchema).min(1),
    status: InputValidator.enum(PurchaseOrderStatusEnum).optional().default(PurchaseOrderStatusEnum.DRAFT)
  })
);

export class PurchaseOrderCreateUsecase implements IUsecase {
  constructor(
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly rawMaterialRepository: IRawMaterialRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(PurchaseOrderCreateSchema)
  async execute(input: PurchaseOrderCreateInput, { tracing, user }: ApiTrancingInput): Promise<PurchaseOrderCreateOutput> {
    // Verify supplier exists
    const supplier = await this.supplierRepository.findById(input.supplierId);
    if (!supplier) {
      throw new ApiNotFoundException('supplierNotFound');
    }

    // Check PO number uniqueness
    const poExists = await this.purchaseOrderRepository.findByPONumber(input.poNumber);
    if (poExists) {
      throw new ApiConflictException('poNumberExists');
    }

    // Verify all materials exist
    for (const item of input.items) {
      const material = await this.rawMaterialRepository.findById(item.materialId);
      if (!material) {
        throw new ApiNotFoundException(`materialNotFound: ${item.materialId}`);
      }
    }

    // Calculate total amount
    const totalAmount = input.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const poEntity = new PurchaseOrderEntity({
      id: UUIDUtils.create(),
      poNumber: input.poNumber,
      supplierId: input.supplierId,
      siteId: input.siteId,
      expectedDate: input.expectedDate,
      status: input.status || PurchaseOrderStatusEnum.DRAFT,
      totalAmount
    });

    const itemEntities = input.items.map((item) =>
      new PurchaseOrderItemEntity({
        id: UUIDUtils.create(),
        purchaseOrderId: poEntity.id,
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })
    );

    const result = await this.purchaseOrderRepository.createWithItems(poEntity, itemEntities);

    this.loggerService.info({ message: 'purchase order created successfully', obj: { po: poEntity } });

    tracing.logEvent('purchase-order-created', `PO: ${poEntity.poNumber} created by: ${user.email}`);

    return result;
  }
}

export type PurchaseOrderCreateInput = Infer<typeof PurchaseOrderCreateSchema>;
export type PurchaseOrderCreateOutput = CreatedModel;

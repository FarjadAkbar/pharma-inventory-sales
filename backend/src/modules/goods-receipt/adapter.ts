import { GoodsReceiptCreateInput, GoodsReceiptCreateOutput } from '@/core/goods-receipt/use-cases/goods-receipt-create';
import { GoodsReceiptDeleteInput, GoodsReceiptDeleteOutput } from '@/core/goods-receipt/use-cases/goods-receipt-delete';
import { GoodsReceiptGetByIdInput, GoodsReceiptGetByIdOutput } from '@/core/goods-receipt/use-cases/goods-receipt-get-by-id';
import { GoodsReceiptListOutput } from '@/core/goods-receipt/use-cases/goods-receipt-list';
import { GoodsReceiptVerifyInput, GoodsReceiptVerifyOutput } from '@/core/goods-receipt/use-cases/goods-receipt-verify';
import { GoodsReceiptListInput } from '@/core/goods-receipt/repository/goods-receipt';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IGoodsReceiptCreateAdapter implements IUsecase {
  abstract execute(input: GoodsReceiptCreateInput, trace: ApiTrancingInput): Promise<GoodsReceiptCreateOutput>;
}

export abstract class IGoodsReceiptGetByIdAdapter implements IUsecase {
  abstract execute(input: GoodsReceiptGetByIdInput): Promise<GoodsReceiptGetByIdOutput>;
}

export abstract class IGoodsReceiptListAdapter implements IUsecase {
  abstract execute(input: GoodsReceiptListInput): Promise<GoodsReceiptListOutput>;
}

export abstract class IGoodsReceiptVerifyAdapter implements IUsecase {
  abstract execute(input: GoodsReceiptVerifyInput, trace: ApiTrancingInput): Promise<GoodsReceiptVerifyOutput>;
}

export abstract class IGoodsReceiptDeleteAdapter implements IUsecase {
  abstract execute(input: GoodsReceiptDeleteInput, trace: ApiTrancingInput): Promise<GoodsReceiptDeleteOutput>;
}

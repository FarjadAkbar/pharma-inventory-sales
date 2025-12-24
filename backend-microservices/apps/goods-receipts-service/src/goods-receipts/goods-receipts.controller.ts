import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GoodsReceiptsService } from './goods-receipts.service';
import { 
  GOODS_RECEIPT_PATTERNS,
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
} from '@repo/shared';

@Controller()
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @MessagePattern(GOODS_RECEIPT_PATTERNS.CREATE)
  create(@Payload() createGoodsReceiptDto: CreateGoodsReceiptDto) {
    return this.goodsReceiptsService.create(createGoodsReceiptDto);
  }

  @MessagePattern(GOODS_RECEIPT_PATTERNS.LIST)
  findAll() {
    return this.goodsReceiptsService.findAll();
  }

  @MessagePattern(GOODS_RECEIPT_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.goodsReceiptsService.findOne(id);
  }

  @MessagePattern(GOODS_RECEIPT_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateGoodsReceiptDto }) {
    return this.goodsReceiptsService.update(data.id, data.updateDto);
  }

  @MessagePattern(GOODS_RECEIPT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.goodsReceiptsService.delete(id);
  }
}


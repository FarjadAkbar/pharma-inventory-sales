import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QCSamplesService } from './qc-samples.service';
import { 
  QC_SAMPLE_PATTERNS,
  CreateQCSampleDto,
  UpdateQCSampleDto,
  AssignTestsToSampleDto,
} from '@repo/shared';

@Controller()
export class QCSamplesController {
  constructor(private readonly qcSamplesService: QCSamplesService) {}

  @MessagePattern(QC_SAMPLE_PATTERNS.CREATE)
  create(@Payload() createQCSampleDto: CreateQCSampleDto) {
    return this.qcSamplesService.create(createQCSampleDto);
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.LIST)
  findAll() {
    return this.qcSamplesService.findAll();
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.qcSamplesService.findOne(id);
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.GET_BY_GOODS_RECEIPT_ITEM)
  findByGoodsReceiptItem(@Payload() goodsReceiptItemId: number) {
    return this.qcSamplesService.findByGoodsReceiptItem(goodsReceiptItemId);
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateQCSampleDto }) {
    return this.qcSamplesService.update(data.id, data.updateDto);
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.RECEIVE_SAMPLE)
  receiveSample(@Payload() id: number) {
    return this.qcSamplesService.receiveSample(id);
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.ASSIGN_TESTS)
  assignTests(@Payload() data: { id: number; assignTestsDto: AssignTestsToSampleDto }) {
    return this.qcSamplesService.assignTests(data.id, data.assignTestsDto);
  }

  @MessagePattern(QC_SAMPLE_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.qcSamplesService.delete(id);
  }
}


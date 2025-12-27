import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QCTestsService } from './qc-tests.service';
import { 
  QC_TEST_PATTERNS,
  CreateQCTestDto,
  UpdateQCTestDto,
} from '@repo/shared';

@Controller()
export class QCTestsController {
  constructor(private readonly qcTestsService: QCTestsService) {}

  @MessagePattern(QC_TEST_PATTERNS.CREATE)
  create(@Payload() createQCTestDto: CreateQCTestDto) {
    return this.qcTestsService.create(createQCTestDto);
  }

  @MessagePattern(QC_TEST_PATTERNS.LIST)
  findAll() {
    return this.qcTestsService.findAll();
  }

  @MessagePattern(QC_TEST_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.qcTestsService.findOne(id);
  }

  @MessagePattern(QC_TEST_PATTERNS.GET_BY_MATERIAL)
  findByMaterial(@Payload() materialId: number) {
    return this.qcTestsService.findByMaterial(materialId);
  }

  @MessagePattern(QC_TEST_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateQCTestDto }) {
    return this.qcTestsService.update(data.id, data.updateDto);
  }

  @MessagePattern(QC_TEST_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.qcTestsService.delete(id);
  }
}


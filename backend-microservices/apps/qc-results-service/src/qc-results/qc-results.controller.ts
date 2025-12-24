import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QCResultsService } from './qc-results.service';
import { 
  QC_RESULT_PATTERNS,
  CreateQCResultDto,
  UpdateQCResultDto,
  SubmitResultsToQADto,
} from '@repo/shared';

@Controller()
export class QCResultsController {
  constructor(private readonly qcResultsService: QCResultsService) {}

  @MessagePattern(QC_RESULT_PATTERNS.CREATE)
  create(@Payload() createQCResultDto: CreateQCResultDto) {
    return this.qcResultsService.create(createQCResultDto);
  }

  @MessagePattern(QC_RESULT_PATTERNS.LIST)
  findAll() {
    return this.qcResultsService.findAll();
  }

  @MessagePattern(QC_RESULT_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.qcResultsService.findOne(id);
  }

  @MessagePattern(QC_RESULT_PATTERNS.GET_BY_SAMPLE)
  findBySample(@Payload() sampleId: number) {
    return this.qcResultsService.findBySample(sampleId);
  }

  @MessagePattern(QC_RESULT_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateQCResultDto }) {
    return this.qcResultsService.update(data.id, data.updateDto);
  }

  @MessagePattern(QC_RESULT_PATTERNS.SUBMIT_TO_QA)
  submitToQA(@Payload() submitResultsDto: SubmitResultsToQADto) {
    return this.qcResultsService.submitToQA(submitResultsDto);
  }

  @MessagePattern(QC_RESULT_PATTERNS.COMPLETE_TESTING)
  completeTesting(@Payload() sampleId: number) {
    return this.qcResultsService.completeTesting(sampleId);
  }

  @MessagePattern(QC_RESULT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.qcResultsService.delete(id);
  }
}


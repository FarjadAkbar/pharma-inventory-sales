import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QC_RESULT_PATTERNS, CreateQCResultDto, UpdateQCResultDto, SubmitResultsToQADto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('qc-results')
export class QCResultsController {
  constructor(@Inject('QUALITY_SERVICE') private client: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQCResultDto) {
    return firstValueFrom(this.client.send(QC_RESULT_PATTERNS.CREATE, createDto));
  }
  @Get()
  async findAll(@Query('sampleId') sampleId?: string) {
    if (sampleId) {
      return firstValueFrom(this.client.send(QC_RESULT_PATTERNS.GET_BY_SAMPLE, parseInt(sampleId, 10)));
    }
    return firstValueFrom(this.client.send(QC_RESULT_PATTERNS.LIST, {}));
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send(QC_RESULT_PATTERNS.GET_BY_ID, parseInt(id, 10)));
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQCResultDto) {
    return firstValueFrom(
      this.client.send(QC_RESULT_PATTERNS.UPDATE, { id: parseInt(id, 10), updateDto }),
    );
  }
  @Post('submit-to-qa')
  async submitToQA(@Body() submitResultsDto: SubmitResultsToQADto) {
    return firstValueFrom(this.client.send(QC_RESULT_PATTERNS.SUBMIT_TO_QA, submitResultsDto));
  }
  @Post('complete-testing/:sampleId')
  async completeTesting(@Param('sampleId') sampleId: string) {
    return firstValueFrom(this.client.send(QC_RESULT_PATTERNS.COMPLETE_TESTING, parseInt(sampleId, 10)));
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(this.client.send(QC_RESULT_PATTERNS.DELETE, parseInt(id, 10)));
  }
}

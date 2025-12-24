import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  QA_RELEASE_PATTERNS,
  CreateQAReleaseDto,
  UpdateQAReleaseDto,
  MakeReleaseDecisionDto,
} from '@repo/shared';

@Controller('qa-releases')
export class QAReleasesController {
  constructor(
    @Inject('QA_RELEASE_SERVICE')
    private qaReleaseClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQAReleaseDto) {
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.CREATE, createDto)
    );
  }

  @Get()
  async findAll(@Query('sampleId') sampleId?: string) {
    if (sampleId) {
      return await firstValueFrom(
        this.qaReleaseClient.send(QA_RELEASE_PATTERNS.GET_BY_SAMPLE, parseInt(sampleId, 10))
      );
    }
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQAReleaseDto) {
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Post(':id/complete-checklist')
  async completeChecklist(@Param('id') id: string, @Body() body: { reviewedBy: number }) {
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.COMPLETE_CHECKLIST, {
        id: parseInt(id, 10),
        reviewedBy: body.reviewedBy,
      })
    );
  }

  @Post(':id/make-decision')
  async makeDecision(@Param('id') id: string, @Body() makeDecisionDto: MakeReleaseDecisionDto) {
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.MAKE_DECISION, {
        id: parseInt(id, 10),
        makeDecisionDto,
      })
    );
  }

  @Post(':id/notify-warehouse')
  async notifyWarehouse(@Param('id') id: string) {
    return await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.NOTIFY_WAREHOUSE, parseInt(id, 10))
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(
      this.qaReleaseClient.send(QA_RELEASE_PATTERNS.DELETE, parseInt(id, 10))
    );
  }
}


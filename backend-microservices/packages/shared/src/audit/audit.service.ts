import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { auditContext } from './audit.subscriber';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  setContext(actorId: number, actorName?: string, correlationId?: string, service = 'unknown') {
    auditContext.enterWith({ actorId, actorName, correlationId, service });
  }

  async record(entry: Partial<AuditLog>) {
    await this.repo.save(this.repo.create(entry));
  }

  async findForEntity(entityType: string, entityId: string | number) {
    return this.repo.find({
      where: { entityType, entityId: Number(entityId) },
      order: { createdAt: 'DESC' },
    });
  }
}


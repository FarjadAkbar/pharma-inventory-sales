import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export const auditContext = new AsyncLocalStorage<{
  actorId: number;
  actorName?: string;
  correlationId?: string;
  service: string;
}>();

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Object;
  }

  async afterInsert(event: InsertEvent<any>) {
    if (this.skipTable(event.metadata.tableName)) return;
    await this.write(event, 'CREATED', event.entity, null, event.entity);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (this.skipTable(event.metadata.tableName)) return;
    await this.write(event, 'UPDATED', event.entity, event.databaseEntity, event.entity);
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (this.skipTable(event.metadata.tableName)) return;
    await this.write(event, 'DELETED', event.databaseEntity, event.databaseEntity, null);
  }

  private skipTable(tableName: string) {
    return ['audit_logs', 'status_history'].includes(tableName);
  }

  private async write(
    event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
    action: string,
    entity: any,
    before: any,
    after: any,
  ) {
    const ctx = auditContext.getStore();
    if (!ctx) return;
    const statusField = this.findStatusField(entity);
    const fromValue = statusField && before ? String(before[statusField] ?? '') : null;
    const toValue = statusField && after ? String(after[statusField] ?? '') : null;

    const log = event.manager.getRepository(AuditLog).create({
      service: ctx.service,
      entityType: event.metadata.tableName,
      entityId: Number(entity?.id ?? 0),
      action: statusField && before ? 'STATUS_CHANGE' : action,
      fromValue,
      toValue,
      diff: this.cleanDiff(before, after),
      actorId: ctx.actorId,
      actorName: ctx.actorName,
      correlationId: ctx.correlationId,
    });

    await event.manager.getRepository(AuditLog).save(log).catch(() => undefined);
  }

  private findStatusField(entity: any): string | null {
    if (!entity) return null;
    for (const f of ['status', 'state', 'stage']) {
      if (f in entity) return f;
    }
    return null;
  }

  private cleanDiff(before: any, after: any): Record<string, { from: unknown; to: unknown }> | null {
    if (!before || !after) return null;
    const diff: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(after)) {
      if (['createdAt', 'updatedAt', 'id'].includes(key)) continue;
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diff[key] = { from: before[key], to: after[key] };
      }
    }
    return Object.keys(diff).length ? diff : null;
  }
}


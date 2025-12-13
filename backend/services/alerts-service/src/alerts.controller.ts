import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ILoggerAdapter } from '@pharma/infra/logger';
import { ALERTS_CREATE, ALERTS_LIST } from '@pharma/utils';

@Controller()
export class AlertsController {
  constructor(private readonly logger: ILoggerAdapter) {}

  @MessagePattern(ALERTS_CREATE)
  async handleAlert(@Payload() data: unknown) {
    this.logger.warn({ message: '🔔 Alert received:\n' + JSON.stringify(data, null, 2) });
    return { status: 'ok', data };
  }

  @MessagePattern(ALERTS_LIST)
  async list(@Payload() data: unknown) {
    // Stub implementation - can be implemented later if needed
    return { docs: [], total: 0, page: 1, limit: 10, message: 'LIST not yet implemented' };
  }
}

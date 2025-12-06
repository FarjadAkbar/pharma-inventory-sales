import { Body, Controller, Post, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { ILoggerAdapter } from '@/infra/logger';
import { ALERTS_CREATE, ALERTS_LIST } from '@shared/constants/message-patterns';

@Controller('alert')
export class AlertsController {
  constructor(
    @Inject('ALERTS_SERVICE') private readonly alertsClient: ClientProxy,
    private readonly logger: ILoggerAdapter
  ) {}

  @Post()
  async handleAlert(@Body() body: unknown) {
    this.logger.warn({ message: '🔔 Alert received:\n' + JSON.stringify(body, null, 2) });
    return firstValueFrom(this.alertsClient.send(ALERTS_CREATE, body));
  }
}

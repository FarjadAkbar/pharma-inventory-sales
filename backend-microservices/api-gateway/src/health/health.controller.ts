import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const parsePort = (v: string | undefined, fallback: number) => {
      const n = parseInt(v ?? '', 10);
      return Number.isNaN(n) ? fallback : n;
    };
    return this.health.check([
      () =>
        this.microservice.pingCheck('identity_service', {
          transport: Transport.TCP,
          options: {
            host: process.env.IDENTITY_SERVICE_HOST || 'localhost',
            port: parsePort(process.env.IDENTITY_SERVICE_PORT, 3001),
          },
        }),
      () =>
        this.microservice.pingCheck('sales_order_service', {
          transport: Transport.TCP,
          options: {
            host: process.env.SALES_ORDER_SERVICE_HOST || 'localhost',
            port: parsePort(process.env.SALES_ORDER_SERVICE_PORT, 3007),
          },
        }),
      () =>
        this.microservice.pingCheck('shipment_service', {
          transport: Transport.TCP,
          options: {
            host: process.env.SHIPMENT_SERVICE_HOST || 'localhost',
            port: parsePort(process.env.SHIPMENT_SERVICE_PORT, 3008),
          },
        }),
    ]);
  }
}

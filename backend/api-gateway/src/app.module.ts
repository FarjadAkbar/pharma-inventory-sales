import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { IUserRepository } from '@pharma/core/user/repository/user';
import { InfraModule } from '@pharma/infra/module';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { LibModule } from '@pharma/libs/module';
import { AuthorizationRoleGuard } from '@pharma/middlewares/guards';
import {
  ExceptionHandlerInterceptor,
  HttpLoggerInterceptor,
  MetricsInterceptor,
  RequestTimeoutInterceptor,
  TracingInterceptor
} from '@pharma/middlewares/interceptors';
import { SERVICE_PORTS } from '@pharma/utils/constants';
import { HealthModule } from './health/health.module';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { SitesController } from './controllers/sites.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { DrugsController } from './controllers/drugs.controller';
import { RawMaterialsController } from './controllers/raw-materials.controller';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { GoodsReceiptsController } from './controllers/goods-receipts.controller';
import { QCSamplesController } from './controllers/qc-samples.controller';
import { QCTestsController } from './controllers/qc-tests.controller';
import { QCResultsController } from './controllers/qc-results.controller';
import { QAReleasesController } from './controllers/qa-releases.controller';
import { DeviationsController } from './controllers/deviations.controller';
import { AlertsController } from './controllers/alerts.controller';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    HealthModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.AUTH_SERVICE
        }
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.USERS_SERVICE
        }
      },
      {
        name: 'ROLES_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ROLES_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.ROLES_SERVICE
        }
      },
      {
        name: 'PERMISSIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PERMISSIONS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.PERMISSIONS_SERVICE
        }
      },
      {
        name: 'SITES_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SITES_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.SITES_SERVICE
        }
      },
      {
        name: 'SUPPLIERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SUPPLIERS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.SUPPLIERS_SERVICE
        }
      },
      {
        name: 'DRUGS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DRUGS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.DRUGS_SERVICE
        }
      },
      {
        name: 'RAW_MATERIALS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.RAW_MATERIALS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.RAW_MATERIALS_SERVICE
        }
      },
      {
        name: 'PURCHASE_ORDERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PURCHASE_ORDERS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.PURCHASE_ORDERS_SERVICE
        }
      },
      {
        name: 'GOODS_RECEIPTS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPTS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.GOODS_RECEIPTS_SERVICE
        }
      },
      {
        name: 'QC_SAMPLES_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_SAMPLES_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.QC_SAMPLES_SERVICE
        }
      },
      {
        name: 'QC_TESTS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_TESTS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.QC_TESTS_SERVICE
        }
      },
      {
        name: 'QC_RESULTS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_RESULTS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.QC_RESULTS_SERVICE
        }
      },
      {
        name: 'QA_RELEASES_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QA_RELEASES_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.QA_RELEASES_SERVICE
        }
      },
      {
        name: 'DEVIATIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DEVIATIONS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.DEVIATIONS_SERVICE
        }
      },
      {
        name: 'ALERTS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ALERTS_SERVICE_HOST || 'localhost',
          port: SERVICE_PORTS.ALERTS_SERVICE
        }
      }
    ])
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
    SitesController,
    SuppliersController,
    DrugsController,
    RawMaterialsController,
    PurchaseOrdersController,
    GoodsReceiptsController,
    QCSamplesController,
    QCTestsController,
    QCResultsController,
    QAReleasesController,
    DeviationsController,
    AlertsController
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory(logger: ILoggerAdapter) {
        return new RequestTimeoutInterceptor(new Reflector(), logger);
      },
      inject: [ILoggerAdapter]
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory() {
        return new ExceptionHandlerInterceptor();
      }
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory(logger: ILoggerAdapter) {
        return new HttpLoggerInterceptor(logger);
      },
      inject: [ILoggerAdapter]
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory(logger: ILoggerAdapter) {
        return new TracingInterceptor(logger);
      },
      inject: [ILoggerAdapter]
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory() {
        return new MetricsInterceptor();
      }
    },
    {
      provide: APP_GUARD,
      useFactory: (repository: IUserRepository) => {
        return new AuthorizationRoleGuard(new Reflector(), repository);
      },
      inject: [IUserRepository]
    }
  ]
})
export class AppModule {}
